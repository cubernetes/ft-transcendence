import type { FastifyRequest } from "fastify";
import { WebSocket } from "ws";
import WebsocketService from "../services/websocket.service";

// import { validateId } from "../utils/validator";

export default class WebsocketController {

    constructor(private readonly websocketService: WebsocketService) {}

    handleConnection(conn: WebSocket, request: FastifyRequest) {
        request.log.info("New WebSocket connection");

        const gameId = "some-unique-game-id"; // You should generate this dynamically
        const userId = Math.floor(Math.random() * 1000); // Replace with actual user ID
        
        this.websocketService.registerConnection(conn, userId, gameId);

        // Retrieve the existing game state
        let gameState = this.websocketService.getGameState(gameId);

        if (!gameState) {
            request.log.error("Game state could not be retrieved.");
            conn.close();
            return;
        }
        
        conn.send(JSON.stringify(gameState));

        conn.on("message", (message: string) => {
            // Handle the message, which updates the game state
            this.websocketService.handleMessage(conn, message, gameId);

            // Retrieve the updated game state
            gameState = this.websocketService.getGameState(gameId);
        });

        conn.on("ping", () => {
            request.log.info("Ping received!");
            conn.pong();
        });

        conn.on("close", () => {
            request.log.info(`WebSocket connection closed for player ${userId}`);
            this.websocketService.removePlayerFromGame(gameId, userId); // Clean up when the player disconnects
        });
        // Full steps: check id -> register ->

        // try {
        //   const userId = validateId(request.params.id);
        //   // Maybe more validation, check user does exist etc.
        //   this.websocketService.registerConnection(conn, userId);
        // } catch (error) {}
    }
}
