import type { FastifyInstance } from "fastify";
import { Result, err, ok } from "neverthrow";
import { ErrorCode, PongConfig, createPongEngine } from "@darrenkuro/pong-core";
import { GameSession, LobbyId } from "./lobby.types.ts";

export const createLobbyService = (app: FastifyInstance) => {
    const lobbyMap: Map<number, LobbyId> = new Map();
    const sessionMap: Map<LobbyId, GameSession> = new Map();

    const generateUniqueId = (length: number = 6): string => {
        const CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // Excluding O 0 I 1
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

        app.log.debug({ session }, `session data after after user ${userId} join`);

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
        app.log.debug(
            { lobbyMap: Array.from(lobbyMap), sessionMap: Array.from(sessionMap) },
            `user ${userId} trying to leave...`
        );

        const lobbyId = lobbyMap.get(userId);
        if (!lobbyId) return err("NOT_IN_LOBBY");

        const session = sessionMap.get(lobbyId);
        if (!session) return err("CORRUPTED_DATA");

        const { players, playerNames, engine } = session;
        const userIdx = players.findIndex((p) => p === userId);

        // Check if a player left the game as it is ongoing
        const state = engine.getState();
        const { status } = state; // Need to make sure that it is not a ref
        if (status === "ongoing" || status === "rendering") {
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

            lobbyMap.delete(userId);
            // DO NOT TOUCH ID, need for winning count
            sessionMap.get(lobbyId)!.playerNames[userIdx] = "";
        } else if (status === "waiting") {
            const isHost = userIdx === 0;

            // If host leaves, kick the guest, for now
            if (isHost) {
                lobbyMap.delete(userId);
                lobbyMap.delete(players[1]);
                sessionMap.delete(lobbyId);

                app.wsService.broadcast(players, { type: "lobby-remove", payload: null });
            } else {
                players.splice(1, 1);
                playerNames.splice(1, 1);
                lobbyMap.delete(userId);

                sendUpdate(lobbyId);
            }
        } else if (status === "ended") {
            lobbyMap.delete(userId);
            const { playerNames } = sessionMap.get(lobbyId)!;
            playerNames[userIdx] = "";

            if (playerNames.every((p) => p === "")) {
                sessionMap.delete(lobbyId);
            }
        }

        app.log.debug(
            { lobbyMap: Array.from(lobbyMap), sessionMap: Array.from(sessionMap) },
            `user ${userId} successfully left`
        );
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

        app.log.debug({ players, playerNames }, "sending updates");

        app.wsService.send(players[0], {
            type: "lobby-update",
            payload: { config, playerNames, host: true },
        });

        if (!players[1]) return ok();

        app.wsService.send(players[1], {
            type: "lobby-update",
            payload: { config, playerNames, host: false },
        });

        return ok();
    };

    const setReady = (userId: number): Result<void, ErrorCode> => {
        const lobbyId = lobbyMap.get(userId);
        if (!lobbyId) return err("NOT_IN_LOBBY");

        const session = sessionMap.get(lobbyId);
        if (!session) return err("CORRUPTED_DATA");

        const { engine, players, playerNames, playerReady } = session;
        const idx = players.findIndex((p) => p === userId);
        playerReady[idx] = true;

        const readyCount = playerReady.filter(Boolean).length;

        const handleQuit = (winnerIdx: 0 | 1) => {
            // Prevent duplicate invocation
            if (session.timeoutHandler) {
                clearTimeout(session.timeoutHandler);
                session.timeoutHandler = undefined;
            }

            const payload = {
                state: engine.getState(),
                hits: engine.getHits(),
                winner: winnerIdx,
            };

            app.wsService.send(players[winnerIdx], {
                type: "game-end",
                payload,
            });

            app.gameService.saveGame(session, payload);
            players.forEach((id) => lobbyMap.delete(id));
            sessionMap.delete(lobbyId);
        };

        const READY_TIMEOUT_MS = 15_000;
        if (readyCount === 1 && !session.timeoutHandler) {
            session.timeoutHandler = setTimeout(() => {
                const readyIdx = playerReady.findIndex((r) => r);
                if (readyIdx !== 0 && readyIdx !== 1) return; // Sanity check

                handleQuit(readyIdx as 0 | 1);
            }, READY_TIMEOUT_MS); // Wait certain ms to declare winner
        }

        if (playerReady.every((b) => b === true)) {
            if (session.timeoutHandler) {
                clearTimeout(session.timeoutHandler);
                session.timeoutHandler = undefined;
            }
            engine.start();
        }

        if (playerNames.some((n) => n === "")) {
            // Someone quit already
            const winnerIdx: 0 | 1 = playerNames[0] === "" ? 1 : 0;
            handleQuit(winnerIdx);
        }
        return ok();
    };

    return { create, join, update, leave, getSessionByUserId, sendUpdate, setReady };
};
