import type { PinoLoggerOptions } from "fastify/types/logger.ts";
import net from "net";
import os from "os";
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
        ignore: "pid,hostname,reqId,responseTime",
    },
};

const getDevLoggerConfig = (): PinoLoggerOptions => {
    return {
        level: "debug",
        transport: consoleTransport,
        serializers: {
            err: formatError,
            req: (req: any) => ({
                method: req.method,
                url: req.url,
                body: req.body,
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
        hostname: os.hostname(),
        service: "backend",
        env: process.env.NODE_ENV || "development",
    };

    const serializers = {
        error: formatError,
        // Don't log full request and response objects
        req: (req: any) => ({
            id: req.id,
            method: req.method,
            url: req.url,
            headers: {
                "user-agent": req.headers["user-agent"],
                "content-type": req.headers["content-type"],
            },
            remoteAddress: req.remoteAddress || req.ip,
        }),
        res: (res: any) => ({
            statusCode: res.statusCode,
        }),
    };

    // Custom hook to add tags
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

                // Add user-related tags
                const msgStr = String(inputArgs[1] || "").toLowerCase();
                if (msgStr.includes("user") || obj.req?.url?.includes("/user")) {
                    if (!obj.tags.includes("user_activity")) {
                        obj.tags.push("user_activity");
                    }
                }

                // Add game-related tags
                if (msgStr.includes("game") || obj.req?.url?.includes("/game")) {
                    if (!obj.tags.includes("game_activity")) {
                        obj.tags.push("game_activity");
                    }
                }

                // Tag errors
                if (obj.level === "error" || obj.level === 50) {
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
                    address: process.env.LOGSTASH_HOSTNAME,
                    port: Number(process.env.LOGSTASH_PORT || 5050),
                    enablePipelining: true,
                    //formatLine: (obj: any) => JSON.stringify(obj) + "\n",
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
