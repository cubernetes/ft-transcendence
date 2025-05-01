import type { FastifyInstance, WebSocket } from "fastify";
import { Result, err, ok } from "neverthrow";
import { desc, eq, or } from "drizzle-orm";
import { PublicGame } from "@darrenkuro/pong-core";
import { OutgoingMessagePayloads as Payloads } from "@darrenkuro/pong-core";
import { games } from "../../core/db/db.schema.ts";
import { ApiError, ServerError } from "../../utils/api-response.ts";
import { GameSession } from "../lobby/lobby.types.ts";
import { Game, NewGame } from "./game.types.ts";

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

            // Save game data to database
            const gameData = toNewGame(session, payload);
            const tryCreateGame = await create(gameData);
            if (tryCreateGame.isErr()) return app.log.error(tryCreateGame.error);
        });
    };

    const toNewGame = (session: GameSession, payload: Payloads["game-end"]): NewGame => {
        return {
            createdAt: session.createdAt,
            player1Id: session.players[0].userId!,
            player2Id: session.players[1].userId!,
            winnerId: session.players[payload.winner].userId!,
            player1Hits: payload.hits[0],
            player2Hits: payload.hits[1],
            player1Score: payload.state.scores[0],
            player2Score: payload.state.scores[1],
        };
    };

    const create = async (data: NewGame): Promise<Result<Game, string>> => {
        try {
            const inserted = await db.insert(games).values(data).returning();
            const game = inserted[0];
            if (!game) return err("Failed to create game: dababase error");

            return ok(game);
        } catch (error) {
            app.log.debug({ error }, "Failed to create game");
            return err("Failed to create game: unknown");
        }
    };

    const getGamesByUsername = async (
        username: string
    ): Promise<Result<PublicGame[], ApiError>> => {
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
            app.log.debug({ error }, "Failed to get games by username");
            return err(new ServerError("Failed to get games by username"));
        }
    };

    const toPublicGame = async (game: Game): Promise<Result<PublicGame, ApiError>> => {
        const tryGetPlayer1Username = await app.userService.getUsernameById(game.player1Id);
        const tryGetPlayer2Username = await app.userService.getUsernameById(game.player2Id);
        if (tryGetPlayer1Username.isErr() || tryGetPlayer2Username.isErr()) {
            return err(new ServerError("Failed to map to public game: can't find username"));
        }

        const player1Username = tryGetPlayer1Username.value;
        const player2Username = tryGetPlayer2Username.value;
        const winnerIndex = game.winnerId === game.player1Id ? 0 : 1;
        const { player1Id, player2Id, winnerId, ...publicGame } = game;
        return ok({ ...publicGame, player1Username, player2Username, winnerIndex });
    };

    return {
        create,
        registerCbHandlers,
        getGamesByUsername,
    };
};
