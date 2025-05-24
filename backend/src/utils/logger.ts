import type { PinoLoggerOptions } from "fastify/types/logger.ts";
import net from "net";
import pino from "pino";
import { ZodError } from "zod";

const formatError = (e: unknown) => {
    if (e instanceof ZodError) {
        return {
            name: "ZodError",
            issues: e.issues.map((i) => i.message),
        };
    }

    if (e instanceof Error) {
        return {
            name: e.name,
            message: e.message,
            stack: e.stack ?? "No stack trace available",
        };
    }

    // Fallback for unknown error
    return {
        message: String(e),
    };
};

// Helper to ensure only plain, serializable objects are logged
export const toPlain = (obj: any) => {
    if (obj instanceof Error) {
        return formatError(obj);
    }
    try {
        return JSON.parse(JSON.stringify(obj));
    } catch {
        return { message: String(obj) };
    }
};

// Enhanced logging utilities for different modules
export const createModuleLogger = (
    logger: any,
    moduleName: string,
    context?: Record<string, any>
) => {
    const moduleContext = {
        module: moduleName,
        service: "backend",
        ...context,
    };

    return {
        trace: (obj: any, msg?: string) => logger.trace({ ...moduleContext, ...obj }, msg),
        debug: (obj: any, msg?: string) => logger.debug({ ...moduleContext, ...obj }, msg),
        info: (obj: any, msg?: string) => logger.info({ ...moduleContext, ...obj }, msg),
        warn: (obj: any, msg?: string) => logger.warn({ ...moduleContext, ...obj }, msg),
        error: (obj: any, msg?: string) => logger.error({ ...moduleContext, ...obj }, msg),
        fatal: (obj: any, msg?: string) => logger.fatal({ ...moduleContext, ...obj }, msg),
    };
};

// Performance tracking utility
export const createPerformanceLogger = (logger: any, operation: string) => {
    const startTime = Date.now();
    const context = {
        operation,
        module: "performance",
        startTime: new Date().toISOString(),
    };

    return {
        end: (additionalContext?: Record<string, any>) => {
            const duration = Date.now() - startTime;
            const logData = {
                ...context,
                duration_ms: duration,
                endTime: new Date().toISOString(),
                ...additionalContext,
            };

            if (duration > 1000) {
                logger.warn(logData, `Slow operation: ${operation} took ${duration}ms`);
            } else {
                logger.debug(logData, `Operation completed: ${operation} took ${duration}ms`);
            }
        },
        mark: (checkpoint: string, additionalContext?: Record<string, any>) => {
            const checkpointTime = Date.now() - startTime;
            logger.debug(
                {
                    ...context,
                    checkpoint,
                    checkpoint_time_ms: checkpointTime,
                    ...additionalContext,
                },
                `Performance checkpoint: ${checkpoint} at ${checkpointTime}ms`
            );
        },
    };
};

const logstashReachable = (timeoutMs: number = 1000): Promise<boolean> => {
    return new Promise((resolve) => {
        const socket = new net.Socket();

        const onFail = () => {
            socket.destroy();
            resolve(false);
        };

        socket.setTimeout(timeoutMs);
        socket.once("error", onFail);
        socket.once("timeout", onFail);

        const { LOGSTASH_HOSTNAME, LOGSTASH_PORT } = process.env;
        if (!LOGSTASH_HOSTNAME || !LOGSTASH_PORT) return onFail();

        socket.connect(Number(LOGSTASH_PORT), LOGSTASH_HOSTNAME, () => {
            socket.end();
            resolve(true);
        });
    });
};

const consoleTransport = {
    target: "pino-pretty",
    options: {
        colorize: true,
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname,reqId,responseTime,module,tags",
    },
};

const getDevLoggerConfig = (): PinoLoggerOptions => {
    return {
        level: "debug",
        transport: consoleTransport,
        serializers: {
            err: formatError,
            req: (req: any) => ({
                id: req.id,
                method: req.method,
                url: req.url,
                headers: {
                    "user-agent": req.headers["user-agent"],
                    "content-type": req.headers["content-type"],
                },
                user_id: req.userId,
                username: req.username,
            }),
            res: (res: any) => ({
                statusCode: res.statusCode,
            }),
        },
    };
};

const getElkLoggerConfig = (): PinoLoggerOptions => {
    const { LOGSTASH_HOSTNAME, LOGSTASH_PORT } = process.env;
    if (!LOGSTASH_HOSTNAME || !LOGSTASH_PORT) return getDevLoggerConfig();

    const level = process.env.NODE_ENV === "production" ? "info" : "debug";

    const base = {
        service: "backend",
        environment: process.env.NODE_ENV || "development",
        instance_id: process.pid,
    };

    const serializers = {
        error: formatError,
        req: (req: any) => ({
            id: req.id,
            method: req.method,
            url: req.url,
            headers: {
                "user-agent": req.headers["user-agent"],
                "content-type": req.headers["content-type"],
                "x-forwarded-for": req.headers["x-forwarded-for"],
            },
            remoteAddress: req.remoteAddress || req.ip,
            user_id: req.userId,
            username: req.username,
        }),
        res: (res: any) => ({
            statusCode: res.statusCode,
            headers: res.headers,
        }),
    };

    // Enhanced hooks for better log enrichment
    const hooks = {
        logMethod(inputArgs: any[], method: (...args: any[]) => any) {
            // Check for context objects in the log message
            if (inputArgs.length >= 2 && typeof inputArgs[0] === "object") {
                const obj = inputArgs[0];

                // Initialize tags array if not present
                if (!obj.tags) {
                    obj.tags = [];
                } else if (!Array.isArray(obj.tags)) {
                    obj.tags = [obj.tags];
                }

                const msgStr = String(inputArgs[1] || "").toLowerCase();

                // Enhanced tagging based on module and context
                if (obj.module) {
                    obj.tags.push(`module_${obj.module}`);
                }

                // User-related tags
                if (
                    msgStr.includes("user") ||
                    obj.req?.url?.includes("/user") ||
                    obj.module === "user"
                ) {
                    if (!obj.tags.includes("user_activity")) {
                        obj.tags.push("user_activity");
                    }
                }

                // Game-related tags
                if (
                    msgStr.includes("game") ||
                    msgStr.includes("lobby") ||
                    obj.req?.url?.includes("/game") ||
                    obj.req?.url?.includes("/lobby") ||
                    ["game", "lobby"].includes(obj.module)
                ) {
                    if (!obj.tags.includes("game_activity")) {
                        obj.tags.push("game_activity");
                    }
                }

                // Performance tags
                if (obj.duration_ms || obj.response_time_ms || obj.operation) {
                    if (!obj.tags.includes("performance")) {
                        obj.tags.push("performance");
                    }
                }

                // Error tags
                if (obj.level === "error" || obj.level === 50 || obj.error) {
                    if (!obj.tags.includes("error")) {
                        obj.tags.push("error");
                    }
                }
            }

            return method.apply(this, inputArgs);
        },
    };

    const transport = {
        targets: [
            consoleTransport,
            {
                target: "pino-socket",
                level,
                options: {
                    mode: "tcp",
                    address: LOGSTASH_HOSTNAME,
                    port: Number(LOGSTASH_PORT || 5050),
                    enablePipelining: true,
                },
            },
        ],
    };

    return {
        timestamp: pino.stdTimeFunctions.isoTime,
        base,
        serializers,
        hooks,
        transport,
    };
};

// Get logger configuration with appropriate transports
export const getLoggerConfig = async (): Promise<PinoLoggerOptions> => {
    return (await logstashReachable()) ? getElkLoggerConfig() : getDevLoggerConfig();
};
