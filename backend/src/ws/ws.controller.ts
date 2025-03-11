// import type { FastifyRequest } from "fastify";
// import { WebSocket } from "ws";
// import WebsocketService from "../services/websocket.service";
// // import { validateId } from "../utils/validator";

// export type Player = {
//     socket: WebSocket;
//     playerId: string;
// };

// export type GameState = {
//     ballPosition: { x: number; y: number };
//     score: { player1: number; player2: number };
//     paddlePosition: { [playerId: string]: { y: number } }; // Optional, depending on your logic
// };

// export type GameSession = {
//     gameId: string;
//     players: { [playerId: string]: Player };
//     state: GameState;
// };

// export default class WebsocketController {
//     constructor(private readonly websocketService: WebsocketService) {}

//     handleConnection(conn: WebSocket, request: FastifyRequest) {
//         // Testing
//         let gameState = {
//             ballPosition: { x: 50, y: 50 }, // Example ball position (center of the field)
//             paddlePosition: {
//                 "player-1": { y: 50 }, // Example initial position for player 1
//                 "player-2": { y: 50 }, // Example initial position for player 2
//             },
//             score: { player1: 0, player2: 0 },
//         };

//         request.log.info("New WebSocket connection");
//         conn.send(JSON.stringify(gameState));

//         conn.on("message", (message: string) => {
//             this.websocketService.handleMessage(conn, message, gameState);
//         });

//         // Full steps: check id -> register ->

//         // try {
//         //   const userId = validateId(request.params.id);
//         //   // Maybe more validation, check user does exist etc.
//         //   this.websocketService.registerConnection(conn, userId);
//         // } catch (error) {}
//     }
// }
