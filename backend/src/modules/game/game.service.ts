import type { GameInsert, GameRecord } from "../../core/db/db.types.ts";
import type { ErrorCode, PublicGame } from "@darrenkuro/pong-core";
import type { FastifyInstance } from "fastify";
import { Result, err, ok } from "neverthrow";
import { desc, eq, or } from "drizzle-orm";
import { OutgoingMessagePayloads as Payloads } from "@darrenkuro/pong-core";
import { games } from "../../core/db/db.schema.ts";
import { createModuleLogger } from "../../utils/logger.ts";
import { GameSession } from "../lobby/lobby.types.ts";

export const createGameService = (app: FastifyInstance) => {
    const { db } = app;
    const logger = createModuleLogger(app.log, "game");

    const registerCbHandlers = (session: GameSession): void => {
        const { engine, players } = session;

        // Track previous scores to detect who scored
        let previousScores: [number, number] = [0, 0];

        engine.onEvent("wall-collision", (payload) =>
            app.wsService.broadcast(players, { type: "wall-collision", payload })
        );

        engine.onEvent("paddle-collision", (payload) =>
            app.wsService.broadcast(players, { type: "paddle-collision", payload })
        );

        engine.onEvent("state-update", (payload) =>
            app.wsService.broadcast(players, { type: "state-update", payload })
        );

        engine.onEvent("score-update", (payload) => {
            const currentScores = payload.scores;

            // Determine who scored by comparing with previous scores
            let scoringPlayer: number = -1;
            if (currentScores[0] > previousScores[0]) {
                scoringPlayer = 0;
            } else if (currentScores[1] > previousScores[1]) {
                scoringPlayer = 1;
            }

            if (scoringPlayer >= 0) {
                logger.info(
                    {
                        event_type: "player_scored",
                        scoring_player_id: players[scoringPlayer],
                        scoring_player_name: session.playerNames[scoringPlayer],
                        current_score: `${currentScores[0]}-${currentScores[1]}`,
                        player1_score: currentScores[0],
                        player2_score: currentScores[1],
                        tags: ["game_activity", "scoring"],
                    },
                    `${session.playerNames[scoringPlayer]} scored! Score: ${currentScores[0]}-${currentScores[1]}`
                );
            }

            // Update previous scores for next comparison
            previousScores = [...currentScores];

            app.wsService.broadcast(players, { type: "score-update", payload });
        });

        engine.onEvent("game-end", async (payload) => {
            app.wsService.broadcast(players, { type: "game-end", payload });
            saveGame(session, payload);
        });
    };

    const saveGame = async (session: GameSession, payload: Payloads["game-end"]): Promise<void> => {
        const gameData = toNewGame(session, payload);
        const tryCreateGame = await create(gameData);
        if (tryCreateGame.isErr()) return app.log.error(tryCreateGame.error);

        const winnerId = session.players[payload.winner];
        const tryGetWinner = await app.userService.findById(winnerId);

        const loserId = session.players[payload.winner === 0 ? 1 : 0];
        const tryGetLoser = await app.userService.findById(loserId);

        if (tryGetWinner.isErr() || tryGetLoser.isErr()) return app.log.error("SERVER_ERROR");

        app.userService.update(winnerId, { wins: tryGetWinner.value.wins + 1 });
        app.userService.update(loserId, { losses: tryGetLoser.value.losses + 1 });

        // Get game config for additional details
        const gameConfig = session.engine.getConfig();

        logger.info(
            {
                event_type: "game_completed",
                game_mode: "online",
                winner_id: winnerId,
                loser_id: loserId,
                winner_name: session.playerNames[payload.winner],
                loser_name: session.playerNames[payload.winner === 0 ? 1 : 0],
                final_score: `${payload.state.scores[0]}-${payload.state.scores[1]}`,
                winner_score: payload.state.scores[payload.winner],
                loser_score: payload.state.scores[payload.winner === 0 ? 1 : 0],
                game_duration_ms: Date.now() - new Date(session.createdAt).getTime(),
                total_hits: payload.hits[0] + payload.hits[1],
                winner_hits: payload.hits[payload.winner],
                loser_hits: payload.hits[payload.winner === 0 ? 1 : 0],
                play_to_score: gameConfig.playTo,
                tags: ["game_activity", "game_outcome", "analytics"],
            },
            `Game completed: ${session.playerNames[payload.winner]} defeated ${session.playerNames[payload.winner === 0 ? 1 : 0]} ${payload.state.scores[payload.winner]}-${payload.state.scores[payload.winner === 0 ? 1 : 0]}`
        );
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
            if (!game) throw new Error("game returned is empty");

            return ok(game);
        } catch (error) {
            app.log.debug({ error }, "fail to create game");
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
            app.log.debug({ error }, "fail to get games by username");
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

    return { create, saveGame, registerCbHandlers, getGamesByUsername };
};
