import { PongEngineEvent, PongState } from "./pong.types";

export type IncomingMessageType = "game-start" | "action";
export type OutgoingMessageType = PongEngineEvent["type"] | "waiting-for-opponent";

export type MessageType = IncomingMessageType | OutgoingMessageType;

export interface IncomingMessagePayloads {
    "game-start": { token: string };
    action: { direction: "up" | "down" | "stop" }; // Get this from somewhere too
}

export interface OutgoingMessagePayloads {
    "wall-collision": null;
    "paddle-collision": null;
    "state-update": { state: PongState };
    "game-start": { gameId: string; opponentId: number };
    "game-end": { winner: number };
    score: { scores: [number, number] };
    "waiting-for-opponent": null;
    "ball-reset": null;
}

export interface IncomingMessage<T extends IncomingMessageType> {
    type: T;
    payload: IncomingMessagePayloads[T];
}

export interface OutgoingMessage<T extends OutgoingMessageType> {
    type: T;
    payload: OutgoingMessagePayloads[T];
}
