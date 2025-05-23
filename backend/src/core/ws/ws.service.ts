import type { FastifyInstance, WebSocket } from "fastify";
import { Result, err, ok } from "neverthrow";
import {
    CLOSING_CODE,
    type IncomingMessageType as InType,
    type OutgoingMessageType as OutType,
    type OutgoingMessage,
    type IncomingMessagePayloads as Payloads,
} from "@darrenkuro/pong-core";

export const createWsService = (app: FastifyInstance) => {
    const conns = new Map<number, WebSocket>();

    type MessageHandler<T extends InType> = (conn: WebSocket, payload: Payloads[T]) => void;
    const handlers = new Map<InType, MessageHandler<InType>>();

    const registerHandler = <T extends InType>(type: T, handler: MessageHandler<T>) => {
        handlers.set(type, handler as MessageHandler<InType>);
    };

    const getHandler = <T extends InType>(type: T): MessageHandler<T> | undefined => {
        return handlers.get(type);
    };

    const send = (id: number, message: OutgoingMessage<OutType>): Result<void, string> => {
        const conn = conns.get(id);
        if (!conn) {
            app.log.error(`can't find sockets by id ${id}`);
            return err(`can't find sockets by id ${id}`);
        }

        if (conn.readyState !== WebSocket.OPEN) {
            app.log.error(`user socket ${id} ready state error`);
            return err(`user socket ${id} ready state error`);
        }

        const { type } = message;
        const LOG_TYPE = ["game-start", "lobby-update", "lobby-remove", "game-end"];

        if (LOG_TYPE.includes(type)) {
            app.log.info({ type }, `send socket message to user ${id}`);
        }

        conn.send(JSON.stringify(message));
        return ok();
    };

    const broadcast = (ids: number[], message: OutgoingMessage<OutType>) => {
        ids.forEach((id) => send(id, message));
    };

    const addConnection = (conn: WebSocket) => {
        app.log.debug("adding socket connection...");

        // If user already try to connect with another socket, close the old one
        const oldConn = conns.get(conn.userId!);
        if (oldConn) oldConn.close(CLOSING_CODE.MULTI_CLIENT);

        conns.set(conn.userId!, conn);
        app.log.debug({ conns: Array.from(conns.keys()) }, "active connections");
    };

    const removeConnection = (conn: WebSocket) => {
        app.log.debug("removing socket connection...");
        conns.delete(conn.userId!);
        app.log.debug({ conns: Array.from(conns.keys()) }, "active connections");
    };

    return {
        registerHandler,
        getHandler,
        send,
        broadcast,
        addConnection,
        removeConnection,
    };
};
