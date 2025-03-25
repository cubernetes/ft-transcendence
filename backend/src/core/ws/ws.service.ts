import { FastifyInstance } from "fastify";
import { WebSocket } from "ws";
// Move these to appropriate places
import type { GameSession, GameState, Player } from "../../modules/game/game.types.ts";
import GameEngine, { GAME_CONSTANTS } from "../../modules/game/game.engine.ts";

export const createWsService = (app: FastifyInstance) => {
    const connections = new Map<number, WebSocket>();
    const gameSessions = new Map<string, GameSession>(); // Track game sessions

    const { log } = app;

    const startGameLoop = (gameId: string, intervalMs: number = 25) => {
        const session = gameSessions.get(gameId);
        if (!session || session.loop) return;

        session.loop = setInterval(() => {
            const newState = session.engine!.update();
            session.state = newState;

            // Broadcast the updated state to all players in the session
            session.players.forEach((player) => {
                player.socket.send(JSON.stringify(session.state));
            });
        }, intervalMs); // Default interval of 25ms = 40 FPS

        log.info(`Game loop started for ${gameId}`);
    };

    const stopGameLoop = (gameId: string) => {
        const session = gameSessions.get(gameId);
        if (!session?.loop) return;

        clearInterval(session.loop);
        session.loop = undefined;
        log.info(`Game loop stopped for ${gameId}`);
    };
    const createGame = (conn: WebSocket, id: number, gameId: string) => {
        log.info(`Registering connection for user ${id}`);
        connections.set(id, conn);

        // Ensure a game session exists
        if (!gameSessions.has(gameId)) {
            const state: GameState = {
                ballPosition: { x: 0, y: 0, z: 0 },
                // TODO: GAME_CONSTANTS defeinitely shouldn't be here, pull from service if needed?
                paddlePosition: {
                    "player-1": { x: -GAME_CONSTANTS.BOARD_WIDTH / 2 + 0.5, y: 0.5, z: 0 },
                    "player-2": { x: GAME_CONSTANTS.BOARD_WIDTH / 2 - 0.5, y: 0.5, z: 0 },
                },
                score: { player1: 0, player2: 0 },
                collisionEvents: [],
            };

            gameSessions.set(gameId, {
                gameId,
                players: new Map<string, Player>(),
                state,
                engine: new GameEngine(state), // Attach engine to session
            });
        }

        // Add the player to the session
        const session = gameSessions.get(gameId)!;

        session.players.set(id.toString(), { socket: conn, playerId: id.toString() });

        // Log the game state and player IDs
        log.info(`Game state after registering player ${id}: ${JSON.stringify(session.state)}`);
        log.info(`Players in game ${gameId}: ${[...session.players.keys()].join(", ")}`);

        // Start the game loop if there's only one player (for now)
        if (session.players.size === 1) {
            startGameLoop(gameId);
        }
    };

    /** Remove a player from the game session */
    const removePlayerFromGame = (gameId: string, userId: number) => {
        const session = gameSessions.get(gameId);
        if (session) {
            session.players.delete(userId.toString());
            log.info(`Player ${userId} removed from game ${gameId}`);
            if (session.players.size === 0) {
                stopGameLoop(gameId);
                gameSessions.delete(gameId);
                log.info(`Game session ${gameId} deleted as there are no players left`);
            }
        }
    };

    const getGameState = (gameId: string): GameState | null => {
        return gameSessions.get(gameId)?.state || null;
    };

    const updateGameState = (gameId: string, newState: GameState) => {
        if (gameSessions.has(gameId)) {
            gameSessions.get(gameId)!.state = newState;
        }
    };

    const dropConnection = (id: number) => {
        log.info(`Dropping connection for user ${id}`);
        connections.delete(id);
    };

    const handleMessage = (conn: WebSocket, msg: string, gameId: string) => {
        const session = gameSessions.get(gameId);

        if (!session) {
            log.error(`Game session ${gameId} not found.`);
            return;
        }

        const gameState = session.state;
        // Log the entire game state for debugging
        log.debug({ gameState }, `gameState for game ${gameId}`);

        // TODO: Feels weird, take a look later
        const playerId = [...session.players.entries()].find(
            ([_, player]) => player.socket === conn
        )?.[0];

        if (!playerId) {
            return log.warn("Unrecognized player tried to send a message.");
        }

        // Dynamically determine the player key
        const playerKey = `player-${session.players.size === 1 ? "1" : "2"}`; // Determine player-1 or player-2 based on session size

        // Log the playerId for debugging
        log.debug(`Player ID for the connection: ${playerId}`);
        log.debug({ gameState });
        log.debug(`Checking if playerKey ${playerKey} exists in paddlePosition`);

        if (!gameState.paddlePosition[playerKey]) {
            return log.error(
                `Paddle position for player ${playerKey} not found in gameState.paddlePosition.`
            );
        }

        const engine = session.engine!;
        const actionHandlers: Record<string, () => void> = {
            "move up": () => engine.setInput(playerKey, "up"),
            "move down": () => engine.setInput(playerKey, "down"),
            "move stop": () => engine.setInput(playerKey, "stop"),
        };

        // Log the action being sent
        log.info(`Received action: ${msg}`);

        if (msg in actionHandlers) {
            actionHandlers[msg]();
        }

        // Broadcast the updated state to all players in the session
        Object.values(session.players).forEach(({ socket }) => {
            socket.send(JSON.stringify(gameState));
        });
    };

    return {
        createGame,
        removePlayerFromGame,
        getGameState,
        updateGameState,
        dropConnection,
        handleMessage,
    };
};
