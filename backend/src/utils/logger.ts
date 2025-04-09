import type { PinoLoggerOptions } from "fastify/types/logger.ts";
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

// const formatGameState = (state: GameState) => {
//     return {
//         ballPosition: `x: ${state.ballPosition.x}, y: ${state.ballPosition.y}, z: ${state.ballPosition.z}`,
//         paddle1Position: `x: ${state.paddlePosition["player-1"].x}, y: ${state.paddlePosition["player-1"].y}, z: ${state.paddlePosition["player-1"].z}`,
//         paddle2Position: `x: ${state.paddlePosition["player-2"].x}, y: ${state.paddlePosition["player-2"].y}, z: ${state.paddlePosition["player-2"].z}`,
//         score: `player1: ${state.score.player1}, player2: ${state.score.player2}`,
//     };
// };

export const devLoggerConfig: PinoLoggerOptions = {
    level: "debug", // More detailed logs in dev
    transport: {
        targets: [
            {
                target: "pino-pretty",
                options: {
                    colorize: true, // Enables colors for better readability
                    translateTime: "HH:MM:ss Z", // Formats timestamps
                    ignore: "pid,hostname", // Hides unnecessary fields
                },
            },
        ],
    },
    serializers: { error: formatError },
};

export const prodLoggerConfig: PinoLoggerOptions = {
    level: "info",
    transport: {
        targets: [
            {
                target: "pino-pretty",
                options: {
                    colorize: true, // Enables colors for better readability
                    translateTime: "HH:MM:ss Z", // Formats timestamps
                    ignore: "pid,hostname", // Hides unnecessary fields
                },
            },
            {
                target: "pino-socket",
                level: "info",
                options: {
                    mode: "tcp",
                    address: process.env.LOGSTASH_HOST || "logstash",
                    port: parseInt(process.env.LOGSTASH_PORT || "5000"),
                    reconnectTimeout: 5000,
                },
            },
        ],
    },
    serializers: { error: formatError },
};
