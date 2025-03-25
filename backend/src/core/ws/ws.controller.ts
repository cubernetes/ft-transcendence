import type { FastifyRequest } from "fastify";
import { WebSocket } from "ws";

export const handleConnection = async (conn: WebSocket, req: FastifyRequest) => {
    const { server } = req;

    server.log.info("New WebSocket connection");

    const gameId = "some-unique-game-id"; // You should generate this dynamically
    const userId = Math.floor(Math.random() * 1000); // Replace with actual user ID

    server.wsService.createGame(conn, userId, gameId);

    // Retrieve the existing game state from the websocket service
    let gameState = server.wsService.getGameState(gameId);

    if (!gameState) {
        server.log.error("Game state could not be retrieved.");
        return conn.close();
    }

    conn.send(JSON.stringify(gameState));

    conn.on("message", (message: string) => {
        // Handle the message, which updates the game state
        server.wsService.handleMessage(conn, message, gameId);

        // Retrieve the updated game state
        gameState = server.wsService.getGameState(gameId);
    });

    conn.on("ping", () => {
        server.log.info("Ping received!");
        conn.pong();
    });

    conn.on("close", () => {
        server.log.info(`WebSocket connection closed for player ${userId}`);
        server.wsService.removePlayerFromGame(gameId, userId); // Clean up when the player disconnects
    });
    // Full steps: check id -> register ->

    // try {
    //   const userId = validateId(request.params.id);
    //   // Maybe more validation, check user does exist etc.
    //   this.websocketService.registerConnection(conn, userId);
    // } catch (error) {}
};
