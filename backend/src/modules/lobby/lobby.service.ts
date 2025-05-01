import type { FastifyInstance, WebSocket } from "fastify";
import { Result, err, ok } from "neverthrow";
import { v4 as uuidv4 } from "uuid";
import { PongConfig, createPongEngine } from "@darrenkuro/pong-core";
import { GameSession, LobbyId } from "../game/game.types.ts";

export const createLobbyService = (app: FastifyInstance) => {
    const gameSessions: Map<LobbyId, GameSession> = new Map();

    const generateUniqueId = (length: number = 6): string => {
        const CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // Exclude O 0 I 1
        const generateId = () =>
            Array.from({ length }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join("");

        // Manually exclude collision
        while (true) {
            const id = generateId();
            if (!gameSessions.has(id)) return id;
        }
    };

    const getTime = () => new Date().toISOString().slice(0, 19).replace("T", " ");

    const create = (conn: WebSocket, config: PongConfig): Result<LobbyId, string> => {
        const { lobbyId } = conn;
        if (lobbyId) return err(`Client is already in a lobby: ${lobbyId}`);

        const id = generateUniqueId();
        const gameId = uuidv4();
        const engine = createPongEngine(config);
        const players = [conn];
        const playerNames = [conn.userDisplayName!];

        gameSessions.set(id, { gameId, engine, players, playerNames, createdAt: getTime() });
        conn.lobbyId = id;
        return ok(id);
    };

    const join = (conn: WebSocket, id: string): Result<GameSession, string> => {
        const { lobbyId } = conn;
        if (lobbyId) return err(`Client is already in a lobby: ${lobbyId}`);

        const session = gameSessions.get(id);
        if (!session) return err(`Couldn't find lobby ${id}`);

        const { players } = session;

        if (players.length >= 2) return err(`Lobby ${id} is full`);
        players.push(conn);

        session.playerNames = players.map((conn) => conn.userDisplayName!);
        return ok(session);
    };

    const updateConfig = (id: string, config: PongConfig): Result<void, string> => {
        const session = gameSessions.get(id);
        if (!session) return err(`Couldn't find lobby ${id}`);

        const { engine } = session;
        engine.reset(config);

        // TODO: make make it tahat only priviledge user can change config?

        return ok();
    };

    const leave = (conn: WebSocket): Result<void, string> => {
        const { lobbyId } = conn;
        if (!lobbyId) return err(`Client is not in any lobby`);

        const session = gameSessions.get(lobbyId);
        if (!session) return err(`Couldn't find lobby ${lobbyId}`);

        const { players } = session;
        const index = players.findIndex((player) => player === conn);

        if (index !== -1) players.splice(index, 1);
        delete conn["lobbyId"];

        // TODO: update names, remove from map if empty,
        // session.playerNames = players.map((conn) => conn.userDisplayName!);
        return ok();
    };

    const getSessionById = (id: string): Result<GameSession, string> => {
        const session = gameSessions.get(id);
        if (!session) return err(`Couldn't find lobby ${id}`);

        return ok(session);
    };

    return {
        create,
        join,
        updateConfig,
        leave,
        getSessionById,
    };
};
