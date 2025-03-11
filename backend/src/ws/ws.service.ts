import { FastifyInstance } from "fastify";
import { WebSocket } from "ws";

export const createWsService = (fastify: FastifyInstance) => {
    const connections = new Map<string, WebSocket>();

    const create = (conn: WebSocket, id: string) => {
        connections.set(id, conn);
        fastify.log.info(`WebSocket connection registered for user ${id}`);
    };

    const remove = (id: string) => {
        connections.delete(id);
        fastify.log.info(`WebSocket connection removed for user ${id}`);
    };

    const handleMessage = (conn: WebSocket, msg: string) => {
        const textMessage = msg.toString();
        fastify.log.info(textMessage);
        conn.send(JSON.stringify({ game: "state" }));
    };

    return {
        create,
        remove,
        handleMessage,
    };
};
