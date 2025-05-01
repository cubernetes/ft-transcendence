import type {
    IncomingMessageType as InType,
    OutgoingMessageType as OutType,
    OutgoingMessage,
    IncomingMessagePayloads as Payloads,
} from "@darrenkuro/pong-core";
import type { FastifyInstance, WebSocket } from "fastify";

export const createWsService = (_: FastifyInstance) => {
    const conns = new Map<number, WebSocket>();

    type MessageHandler<T extends InType> = (conn: WebSocket, payload: Payloads[T]) => void;
    const handlers = new Map<InType, MessageHandler<InType>>();

    const registerHandler = <T extends InType>(type: T, handler: MessageHandler<T>) => {
        handlers.set(type, handler as MessageHandler<InType>);
    };

    const getHandler = <T extends InType>(type: T): MessageHandler<T> | undefined => {
        return handlers.get(type);
    };

    const send = (conn: WebSocket, message: OutgoingMessage<OutType>) => {
        conn.send(JSON.stringify(message));
    };

    const broadcast = (conns: WebSocket[], message: OutgoingMessage<OutType>) => {
        conns.forEach((conn) => send(conn, message));
    };

    const addConnection = (conn: WebSocket) => {
        conns.set(conn.userId!, conn);
    };

    const removeConnection = (conn: WebSocket) => {
        conns.delete(conn.userId!);
    };

    return { registerHandler, getHandler, send, broadcast, addConnection, removeConnection };
};
