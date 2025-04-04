import type {
    IncomingMessagePayloads,
    IncomingMessageType,
    OutgoingMessage,
    OutgoingMessageType,
    createPongEngine,
} from "@darrenkuro/pong-core";
import { WebSocket } from "fastify";

export type GameId = string;
export type PongEngine = ReturnType<typeof createPongEngine>;

export type QueuedMessage = [WebSocket, OutgoingMessage<OutgoingMessageType>];
export type OutgoingMessages = QueuedMessage[];

export type MessageHandler<T extends IncomingMessageType> = (
    conn: WebSocket,
    payload: IncomingMessagePayloads[T]
) => void;
