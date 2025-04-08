// import { Direction } from "../game.types";
// import { logger } from "../utils/logger";
// import { GameStateManager } from "./managers.state";

// export const createWebsocket = () => {
//     const socket: WebSocket = new WebSocket("/ws"); // don't hard code
// };
// export class WebSocketManager {
//     socket: WebSocket;
//     lastDirection: string = "stop";

//     constructor(private gameStateManager: GameStateManager) {
//         this.socket = new WebSocket("/ws");
//         this.setupSocketHandlers();
//     }

//     setupSocketHandlers() {
//         this.socket.onmessage = (event) => {
//             try {
//                 const message = JSON.parse(event.data); // Parse incoming message

//                 if (!message.type) {
//                     window.log.warn("Received WebSocket message without a type:", message);
//                     return;
//                 }
//                 window.log.info("Received WebSocket message:", message);

//                 switch (message.type) {
//                     case "game-start":
//                         this.gameStateManager.startGame(message.payload);
//                         break;

//                     case "game-end":
//                         this.gameStateManager.endGame(message.payload.winner);
//                         break;

//                     case "score":
//                         this.gameStateManager.updateScore(message.payload.scores);
//                         break;

//                     case "wall-collision":
//                         this.gameStateManager.handleWallCollision();
//                         break;

//                     case "paddle-collision":
//                         this.gameStateManager.handlePaddleCollision();
//                         break;

//                     case "state-update":
//                         this.gameStateManager.updateGameObjects(message.payload);
//                         break;

//                     default:
//                         window.log.warn("Unknown WebSocket event type:", message.type);
//                 }
//             } catch (error) {
//                 window.log.error("Error parsing WebSocket message:", error, event.data);
//             }
//         };

//         this.socket.onopen = () => {
//             window.log.info("WebSocket connection established.");
//         };

//         this.socket.onerror = (error) => {
//             window.log.error("WebSocket error:", error);
//         };

//         this.socket.onclose = () => {
//             window.log.info("WebSocket connection closed.");
//         };
//     }

//     sendGameStart() {
//         window.log.debug("in function sendGameStart");
//         if (this.socket.readyState === WebSocket.OPEN) {
//             window.log.info("Sending game-start");

//             const jwtToken: string | null = localStorage.getItem("token");
//             if (!jwtToken) {
//                 window.log.error("JWT token not found in local storage.");
//                 return;
//             }

//             window.log.info("JWT token:", jwtToken);

//             const message = JSON.stringify({
//                 type: "game-start",
//                 payload: {
//                     token: jwtToken,
//                 },
//             });
//             this.socket.send(message);
//             window.log.debug("Game start message sent:", message);
//         } else {
//             window.log.error("WebSocket is not open.");
//         }
//     }

//     sendDirection(direction: Direction) {
//         window.log.info(`Sending direction: ${direction}`);
//         if (direction !== this.lastDirection && this.socket.readyState === WebSocket.OPEN) {
//             const message = JSON.stringify({
//                 type: "game-action",
//                 payload: {
//                     gameId: this.gameStateManager.getGameId(),
//                     index: this.gameStateManager.getPlayerIndex(),
//                     action: direction,
//                 },
//             });
//             this.socket.send(message);
//             this.lastDirection = direction;
//         }
//     }
// }
