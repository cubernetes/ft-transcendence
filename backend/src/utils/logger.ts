import { ZodError } from "zod";
import { GameState } from "../game/game.types.ts";
import type { PinoLoggerOptions } from "fastify/types/logger.ts";

const formatError = (error: unknown) => {
    if (error instanceof ZodError) {
        return {
            name: "ZodError",
            issues: error.issues.map((i) => `${i.path}: ${i.message}`),
        };
    }

    if (error instanceof Error) {
        return {
            name: error.name,
            message: error.message,
            stack: error.stack ?? "No stack trace available",
        };
    }

    /** Fallback for unknown error */
    return {
        message: String(error),
    };
};

const formatGameState = (state: GameState) => {
    return {
        ballPosition: `x: ${state.ballPosition.x}, y: ${state.ballPosition.y}, z: ${state.ballPosition.z}`,
        paddle1Position: `x: ${state.paddlePosition["player-1"].x}, y: ${state.paddlePosition["player-1"].y}, z: ${state.paddlePosition["player-1"].z}`,
        paddle2Position: `x: ${state.paddlePosition["player-2"].x}, y: ${state.paddlePosition["player-2"].y}, z: ${state.paddlePosition["player-2"].z}`,
        score: `player1: ${state.score.player1}, player2: ${state.score.player2}`,
    };
};

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
            // {
            //     target: "pino-socket",
            //     level: "info",
            //     options: {
            //         mode: "tcp",
            //         address: process.env.LOGSTASH_HOST || "logstash",
            //         port: parseInt(process.env.LOGSTASH_PORT || "5000"),
            //         reconnectTimeout: 1000,
            //     }
            // }
        ],
    },
    serializers: { err: formatError, gameState: formatGameState },
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
                    reconnectTimeout: 1000,
                },
            },
        ],
    },
    serializers: { err: formatError, gameState: formatGameState },
};
