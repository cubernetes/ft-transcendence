import type { FastifyInstance, WebSocket } from "fastify";
import { MessageHandler } from "./ws.types.ts";
import { IncomingMessageType, OutgoingMessage, OutgoingMessageType } from "@darrenkuro/pong-core";
import { err, ok, Result } from "neverthrow";

export const createWsService = (_: FastifyInstance) => {
    const connections = new Set<WebSocket>();
    const handlers = new Map<IncomingMessageType, MessageHandler<IncomingMessageType>>();

    const registerHandler = <T extends IncomingMessageType>(
        type: T,
        handler: MessageHandler<T>
    ) => {
        handlers.set(type, handler as MessageHandler<IncomingMessageType>);
    };

    const getHandler = <T extends IncomingMessageType>(
        type: T
    ): Result<MessageHandler<T>, Error> => {
        if (!handlers.has(type)) {
            return err(new Error(`Handler for type ${type} not found`));
        }
        return ok(handlers.get(type) as MessageHandler<T>);
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

    return { registerHandler, getHandler, send, broadcast, addConnection, removeConnection };
};
