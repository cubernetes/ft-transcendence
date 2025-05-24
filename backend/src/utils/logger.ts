import type { PinoLoggerOptions } from "fastify/types/logger.ts";
import os from "os";
import pino from "pino";
import { ZodError } from "zod";

const hostname = os.hostname();

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
export function toPlain(obj: any) {
    if (obj instanceof Error) {
        return formatError(obj);
    }
    try {
        return JSON.parse(JSON.stringify(obj));
    } catch {
        return { message: String(obj) };
    }
}

const elkLoggerConfig = {
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug"),
    base: {
        hostname: hostname,
        service: "backend",
        env: process.env.NODE_ENV || "development",
    },
    serializers: {
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
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    // Custom hook to add tags
    hooks: {
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
    },
};

const devConsoleLoggerConfig: PinoLoggerOptions = {
    level: "debug",
    base: undefined,
    transport: {
        target: "pino-pretty",
        options: {
            colorize: true,
            translateTime: "HH:MM:ss Z",
            ignore: "pid,hostname,reqId,responseTime",
        },
    },
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

// Get logger configuration with appropriate transports
export const getLoggerConfig = (): PinoLoggerOptions => {
    // Always include the console transport for local visibility
    const consoleTransport = {
        target: "pino-pretty",
        options: {
            colorize: true,
            translateTime: "HH:MM:ss Z",
            ignore: "pid,hostname",
        },
    };

    // Add ELK transport if LOGSTASH_HOSTNAME is defined
    if (process.env.LOGSTASH_HOSTNAME) {
        return {
            ...elkLoggerConfig,
            transport: {
                targets: [
                    {
                        ...consoleTransport,
                        level: elkLoggerConfig.level,
                    },
                    {
                        target: "pino-socket",
                        level: elkLoggerConfig.level,
                        options: {
                            mode: "tcp",
                            address: process.env.LOGSTASH_HOSTNAME,
                            port: Number(process.env.LOGSTASH_PORT || 5050),
                            enablePipelining: true,
                            //formatLine: (obj: any) => JSON.stringify(obj) + "\n",
                        },
                    },
                ],
            },
        };
    }

    return process.env.NODE_ENV === "production"
        ? {
              ...elkLoggerConfig,
              transport: consoleTransport,
          }
        : devConsoleLoggerConfig;
};
