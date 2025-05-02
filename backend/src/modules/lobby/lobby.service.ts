import type { FastifyInstance, WebSocket } from "fastify";
import { Result, err, ok } from "neverthrow";
import { PongConfig, createPongEngine } from "@darrenkuro/pong-core";
import { GameSession, LobbyId } from "./lobby.types.ts";

export const createLobbyService = (app: FastifyInstance) => {
    const lobbyMap: Map<LobbyId, GameSession> = new Map();

    const generateUniqueId = (length: number = 6): string => {
        const CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // Exclude O 0 I 1
        const generateId = () =>
            Array.from({ length }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join("");

        // Manually exclude collision
        while (true) {
            const id = generateId();
            if (!lobbyMap.has(id)) return id;
        }
    };

    const getTime = () => new Date().toISOString().slice(0, 19).replace("T", " ");

    const create = (conn: WebSocket, config: PongConfig): Result<LobbyId, string> => {
        const { lobbyId } = conn;
        if (lobbyId) return err(`Client is already in a lobby: ${lobbyId}`);

        const id = generateUniqueId();
        const engine = createPongEngine(config);
        const players = [conn];
        const playerNames = [conn.userDisplayName!];
        const createdAt = getTime();

        lobbyMap.set(id, { createdAt, engine, players, playerNames });
        conn.lobbyId = id;
        return ok(id);
    };

    const join = (conn: WebSocket, id: string): Result<GameSession, string> => {
        const { lobbyId } = conn;
        if (lobbyId) return err(`Client is already in a lobby: ${lobbyId}`);

        const session = lobbyMap.get(id);
        if (!session) return err(`Couldn't find lobby ${id}`);

        const { players } = session;

        if (players.length >= 2) {
            app.wsService.send(conn, { type: "lobby-full", payload: null });
            return err(`Lobby ${id} is full`);
        }

        players.push(conn);
        session.playerNames = players.map((conn) => conn.userDisplayName!);
        return ok(session);
    };

    const leave = (conn: WebSocket): Result<void, string> => {
        const { lobbyId } = conn;
        if (!lobbyId) return err(`Client is not in any lobby`);

        const session = lobbyMap.get(lobbyId);
        if (!session) return err(`Couldn't find lobby ${lobbyId}`);

        const { players } = session;
        const index = players.findIndex((player) => player === conn);
        const isHost = index === 0;
        if (isHost) {
            if (players) lobbyMap.delete(lobbyId);
            delete conn["lobbyId"];
        }

        //if (index !== -1) players.splice(index, 1);
        delete conn["lobbyId"];

        // TODO: update names, remove from map if empty,
        // session.playerNames = players.map((conn) => conn.userDisplayName!);
        return ok();
    };

    const getSessionById = (id: string): Result<GameSession, string> => {
        const session = lobbyMap.get(id);
        if (!session) return err(`Couldn't find lobby ${id}`);

        return ok(session);
    };

    return { create, join, leave, getSessionById };
};
