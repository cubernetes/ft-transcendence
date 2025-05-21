import type { FastifyInstance } from "fastify";
import { Result, err, ok } from "neverthrow";
import { ErrorCode, PongConfig, createPongEngine } from "@darrenkuro/pong-core";
import { GameSession, LobbyId } from "./lobby.types.ts";

export const createLobbyService = (app: FastifyInstance) => {
    const lobbyMap: Map<number, LobbyId> = new Map();
    const sessionMap: Map<LobbyId, GameSession> = new Map();

    const generateUniqueId = (length: number = 6): string => {
        const CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // Exclude O 0 I 1
        const generateId = () =>
            Array.from({ length }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join("");

        // Manually exclude collision
        while (true) {
            const id = generateId();
            if (!sessionMap.has(id)) return id;
        }
    };

    const getTime = () => new Date().toISOString().slice(0, 19).replace("T", " ");

    const create = (userId: number, name: string, cfg: PongConfig): Result<LobbyId, ErrorCode> => {
        if (lobbyMap.has(userId)) return err("ALREADY_IN_LOBBY");

        const lobbyId = generateUniqueId();
        const createdAt = getTime();
        const engine = createPongEngine(cfg);
        const players = [userId];
        const playerNames = [name];
        const playerReady = [false, false];

        sessionMap.set(lobbyId, { createdAt, engine, players, playerNames, playerReady });
        lobbyMap.set(userId, lobbyId);

        return ok(lobbyId);
    };

    const join = (userId: number, name: string, lobbyId: string): Result<LobbyId, ErrorCode> => {
        if (lobbyMap.has(userId)) return err("ALREADY_IN_LOBBY");

        const session = sessionMap.get(lobbyId);
        if (!session) return err("LOBBY_NOT_FOUND");

        const { players, playerNames } = session;
        if (players.length >= 2) return err("LOBBY_FULL");

        players.push(userId);
        playerNames.push(name);
        lobbyMap.set(userId, lobbyId);

        return ok(lobbyId);
    };

    const update = (userId: number, config: Partial<PongConfig>): Result<LobbyId, ErrorCode> => {
        const lobbyId = lobbyMap.get(userId);
        if (!lobbyId) return err("NOT_IN_LOBBY");

        const session = sessionMap.get(lobbyId);
        if (!session) return err("CORRUPTED_DATA");

        const { engine, players } = session;
        if (userId !== players[0]) return err("UNAUTHORIZED");

        const tryResetEngine = engine.reset(config);
        if (tryResetEngine.isErr()) return err(tryResetEngine.error);

        return ok(lobbyId);
    };

    const leave = (userId: number): Result<void, ErrorCode> => {
        const lobbyId = lobbyMap.get(userId);
        if (!lobbyId) return err("NOT_IN_LOBBY");

        const session = sessionMap.get(lobbyId);
        if (!session) return err("CORRUPTED_DATA");

        const { players, playerNames, engine } = session;
        const userIdx = players.findIndex((p) => p === userId);

        // Check if a player left the game as it is ongoing
        const state = engine.getState();
        if (state.status === "ongoing") {
            // Manually stop the engine
            engine.stop();

            // Set the remaining (the other) player as the winner
            const winnerIdx: 1 | 0 = userIdx === 0 ? 1 : 0;
            const payload = { state, hits: engine.getHits(), winner: winnerIdx };
            app.wsService.send(players[winnerIdx], {
                type: "game-end",
                payload,
            });
            app.gameService.saveGame(session, payload);
            return ok();
        }

        const isHost = userIdx === 0;

        // If host leaves, kick the guest, for now
        if (isHost) {
            lobbyMap.delete(userId);
            lobbyMap.delete(players[1]);
            sessionMap.delete(lobbyId);

            app.wsService.broadcast(players, { type: "lobby-remove", payload: null });
        } else {
            // Remove player 1 by name first
            playerNames.splice(1, 1);

            sendUpdate(lobbyId);

            // Remove player 1 from backend memory
            players.splice(1, 1);
            lobbyMap.delete(userId);
        }
        return ok();
    };

    const getSessionByUserId = (userId: number): Result<GameSession, ErrorCode> => {
        const lobbyId = lobbyMap.get(userId);
        if (!lobbyId) return err("NOT_IN_LOBBY");

        const session = sessionMap.get(lobbyId);
        if (!session) return err("CORRUPTED_DATA");

        return ok(session);
    };

    const sendUpdate = (lobbyId: string): Result<void, ErrorCode> => {
        const session = sessionMap.get(lobbyId);
        if (!session) return err("SERVER_ERROR");

        const { engine, players, playerNames } = session;
        const config = engine.getConfig();

        app.wsService.send(players[0], {
            type: "lobby-update",
            payload: { config, playerNames, host: true },
        });

        app.wsService.send(
            players[1],
            playerNames[1]
                ? {
                      type: "lobby-update",
                      payload: { config, playerNames, host: false },
                  }
                : {
                      type: "lobby-remove",
                      payload: null,
                  }
        );

        return ok();
    };

    const setReady = (userId: number): Result<void, ErrorCode> => {
        const lobbyId = lobbyMap.get(userId);
        if (!lobbyId) return err("NOT_IN_LOBBY");

        const session = sessionMap.get(lobbyId);
        if (!session) return err("CORRUPTED_DATA");

        const { engine, players, playerReady } = session;
        const idx = players.findIndex((p) => p === userId);
        playerReady[idx] = true;

        if (playerReady.every((b) => b === true)) engine.start();
        return ok();
    };

    return { create, join, update, leave, getSessionByUserId, sendUpdate, setReady };
};
