import type { GameInsert, GameRecord } from "../../core/db/db.types.ts";
import type { FastifyInstance } from "fastify";
import { Result, err, ok } from "neverthrow";
import { desc, eq, or } from "drizzle-orm";
import { ErrorCode, PublicGame } from "@darrenkuro/pong-core";
import { OutgoingMessagePayloads as Payloads } from "@darrenkuro/pong-core";
import { games } from "../../core/db/db.schema.ts";
import { GameSession } from "../lobby/lobby.types.ts";

export const createGameService = (app: FastifyInstance) => {
    const { db } = app;

    const registerCbHandlers = (session: GameSession): void => {
        const { engine, players } = session;

        engine.onEvent("wall-collision", (payload) =>
            app.wsService.broadcast(players, { type: "wall-collision", payload })
        );

        engine.onEvent("paddle-collision", (payload) =>
            app.wsService.broadcast(players, { type: "paddle-collision", payload })
        );

        engine.onEvent("state-update", (payload) =>
            app.wsService.broadcast(players, { type: "state-update", payload })
        );

        engine.onEvent("score-update", (payload) =>
            app.wsService.broadcast(players, { type: "score-update", payload })
        );

        engine.onEvent("game-end", async (payload) => {
            app.wsService.broadcast(players, { type: "game-end", payload });
            saveGame(session, payload);
        });
    };

    const saveGame = async (session: GameSession, payload: Payloads["game-end"]): Promise<void> => {
        const gameData = toNewGame(session, payload);
        const tryCreateGame = await create(gameData);
        if (tryCreateGame.isErr()) return app.log.error(tryCreateGame.error);
    };

    const toNewGame = (session: GameSession, payload: Payloads["game-end"]): GameInsert => {
        return {
            createdAt: session.createdAt,
            player1Id: session.players[0],
            player2Id: session.players[1],
            winnerId: session.players[payload.winner],
            player1Hits: payload.hits[0],
            player2Hits: payload.hits[1],
            player1Score: payload.state.scores[0],
            player2Score: payload.state.scores[1],
        };
    };

    const create = async (data: GameInsert): Promise<Result<GameRecord, ErrorCode>> => {
        try {
            const inserted = await db.insert(games).values(data).returning();
            const game = inserted[0];
            if (!game) throw new Error("Game returned is empty");

            return ok(game);
        } catch (error) {
            app.log.debug({ error }, "Fail to create game");
            return err("SERVER_ERROR");
        }
    };

    const getGamesByUsername = async (
        username: string
    ): Promise<Result<PublicGame[], ErrorCode>> => {
        const tryGetUser = await app.userService.findByUsername(username);
        if (tryGetUser.isErr()) return err(tryGetUser.error);

        const user = tryGetUser.value;
        try {
            const userGames = db
                .select()
                .from(games)
                .where(or(eq(games.player1Id, user.id), eq(games.player2Id, user.id)))
                .orderBy(desc(games.createdAt))
                .all();

            const result: PublicGame[] = [];
            for (const game of userGames) {
                const tryMapGame = await toPublicGame(game);
                if (tryMapGame.isErr()) return err(tryMapGame.error);

                result.push(tryMapGame.value);
            }

            return ok(result);
        } catch (error) {
            app.log.debug({ error }, "Fail to get games by username");
            return err("SERVER_ERROR");
        }
    };

    const toPublicGame = async (game: GameRecord): Promise<Result<PublicGame, ErrorCode>> => {
        const tryGetUsername1 = await app.userService.getUsernameById(game.player1Id);
        const tryGetUsername2 = await app.userService.getUsernameById(game.player2Id);
        // Should never happen if data handled correctly
        if (tryGetUsername1.isErr() || tryGetUsername2.isErr()) return err("SERVER_ERROR");

        const player1Username = tryGetUsername1.value;
        const player2Username = tryGetUsername2.value;
        const winnerIndex = game.winnerId === game.player1Id ? 0 : 1;
        const { player1Id, player2Id, winnerId, ...publicGame } = game;
        return ok({ ...publicGame, player1Username, player2Username, winnerIndex });
    };

    return {
        create,
        saveGame,
        registerCbHandlers,
        getGamesByUsername,
    };
};
