import type { FastifyInstance } from "fastify";
import { v4 as uuidv4 } from "uuid";
import PongEngine from "./pong.engine.ts";
import { err, ok, Result } from "neverthrow";
import type { WebSocket } from "fastify";
import { LocalUserInput, UserInput } from "./pong.types.ts";
import { LocalGamePayload, OutgoingMessage, OutgoingMessageType } from "../ws/ws.types.ts";

export const createPongService = (_: FastifyInstance) => {
    //const localGameSessions: Map<string, WebSocket> = new Map();
    const matchmakingQueue: WebSocket[] = []; // socket knows its own userId
    const remoteGameSessions: Map<string, PongEngine> = new Map();

    const enqueuePlayer = (conn: WebSocket): Result<void, Error> => {
        matchmakingQueue.push(conn);
        return ok();
    };

    const dequeue = (): Result<WebSocket, Error> => {
        const opponent = matchmakingQueue.shift();
        if (!opponent) {
            return err(new Error("No opponent found"));
        }
        return ok(opponent);
    };

    const hasWaitingPlayer = (): boolean => {
        return matchmakingQueue.length > 0;
    };

    const startLocalGame = (conn: WebSocket, intervalMs: number = 25): Result<void, Error> => {
        //const gameId = uuidv4();
        //localGameSessions.set(gameId, conn);

        const gameEngine = new PongEngine();
        conn.localPongSession = {
            gameId: uuidv4(), // probably don't even need id for local games?
            engine: gameEngine,
        };

        setInterval(() => {
            gameEngine.tick();
            const state = gameEngine.getState();
            if (state.isErr()) {
                // Handle error, close connection? Stop game?
                return err(state.error);
            }
            conn.send(JSON.stringify(state.value));
        }, intervalMs); // Default interval of 25ms = 40 FPS

        return ok();
    };

    const updateLocalGame = (conn: WebSocket, payload: LocalGamePayload): Result<void, Error> => {
        if (!conn.localPongSession) {
            return err(new Error("No local game session found"));
        }

        const { engine } = conn.localPongSession;
        const { index, action } = payload;
        engine.setInput(index, action as UserInput);

        return ok();
    };

    const startRemoteGame = (conn: WebSocket): Result<OutgoingMessage, Error> => {
        if (!hasWaitingPlayer()) {
            enqueuePlayer(conn);
            return ok({
                type: "waiting-for-opponent",
                payload: null,
            });
        }

        // TODO: Check waiting logic, feels a little off potentially if almost simultaneous connection? async properly?
        const opponent = dequeue();
        if (opponent.isErr()) {
            return err(opponent.error);
        }

        const gameEngine = new PongEngine();
        const gameId = uuidv4();
        remoteGameSessions.set(gameId, gameEngine);

        return ok({
            type: "game-start",
            payload: {
                gameId,
                opponentId: opponent.value.userId,
            },
        });
    };
    // startLocalGame
    // startRemoteGame
    // getGameState
    // setInput
    // resumeGame
    // endGame

    return { startLocalGame, updateLocalGame };
};
