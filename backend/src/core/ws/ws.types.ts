import type { createPongEngine, OutgoingMessage } from "@darrenkuro/pong-core";
import { WebSocket } from "fastify";

export type GameId = string;
export type PongEngine = ReturnType<typeof createPongEngine>;

export type QueuedMessage = [WebSocket, OutgoingMessage];
export type OutgoingMessages = QueuedMessage[];
