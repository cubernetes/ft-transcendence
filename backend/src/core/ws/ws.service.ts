import type { FastifyInstance, WebSocket } from "fastify";
import { MessageHandler } from "./ws.types.ts";
import { IncomingMessageType, OutgoingMessage, OutgoingMessageType } from "@darrenkuro/pong-core";

export const createWsService = (app: FastifyInstance) => {
    const connections = new Set<WebSocket>();
    const handlers = new Map<IncomingMessageType, MessageHandler<IncomingMessageType>>();

    const registerHandler = <T extends IncomingMessageType>(
        type: T,
        handler: MessageHandler<T>
    ) => {
        handlers.set(type, handler as MessageHandler<IncomingMessageType>);
    };

    const send = (conn: WebSocket, message: OutgoingMessage<OutgoingMessageType>) => {
        conn.send(JSON.stringify(message));
    };

    const broadcast = (conns: WebSocket[], message: OutgoingMessage<OutgoingMessageType>) => {
        conns.forEach((conn) => send(conn, message));
    };

    const addConnection = (conn: WebSocket) => {
        connections.add(conn);
    };

    const removeConnection = (conn: WebSocket) => {
        connections.delete(conn);
    };

    return { handlers, registerHandler, send, broadcast, addConnection, removeConnection };
};

// export const createWsService = (app: FastifyInstance) => {
//     const matchmakingQueue: WebSocket[] = []; // socket knows its own userId
//     const gameSessions: Map<GameId, PongEngine> = new Map();
//     const gamePlayers: Map<GameId, [WebSocket, WebSocket]> = new Map();

//     const enqueuePlayer = (conn: WebSocket): Result<void, Error> => {
//         matchmakingQueue.push(conn);
//         return ok();
//     };

//     const dequeuePlayer = (): Result<WebSocket, Error> => {
//         const opponent = matchmakingQueue.shift();
//         if (!opponent) {
//             return err(new Error("No opponent found"));
//         }
//         return ok(opponent);
//     };

//     const hasWaitingPlayer = (): boolean => {
//         return matchmakingQueue.length > 0;
//     };

//     const handleRemoteGame = (conn: WebSocket, payload: any): Result<OutgoingMessages, Error> => {
//         if (!hasWaitingPlayer()) {
//             enqueuePlayer(conn);
//             const msg: QueuedMessage = [
//                 conn,
//                 {
//                     type: "waiting-for-opponent",
//                     payload: null,
//                 },
//             ];
//             return ok([msg]);
//         }

//         const opponent = dequeuePlayer();
//         if (opponent.isErr()) {
//             return err(opponent.error);
//         }

//         const gameEngine = createPongEngine();
//         const gameId = uuidv4();
//         gameSessions.set(gameId, gameEngine);
//         gamePlayers.set(gameId, [opponent.value, conn]);
//         gameEngine.start();
//         const msg: QueuedMessage = [
//             conn,
//             {
//                 type: "game-start",
//                 payload: {
//                     gameId,
//                     opponentId: opponent.value.userId,
//                 },
//             },
//         ];

//         const msgOpponent: QueuedMessage = [
//             opponent.value,
//             {
//                 type: "game-start",
//                 payload: {
//                     gameId,
//                     opponentId: opponent.value.userId,
//                 },
//             },
//         ];
//         return ok([msg, msgOpponent]);
//     };

//     const messageHandlers: Record<
//         MessageType,
//         (conn: WebSocket, payload: any) => Result<OutgoingMessages, Error>
//     > = { "remote-game": handleRemoteGame };

//     return { messageHandlers };
// };
