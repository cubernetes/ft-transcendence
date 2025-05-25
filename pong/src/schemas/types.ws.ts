import { EventMap, PongConfig, UserInput } from "../pong/pong.types";

export const CLOSING_CODE = {
    MULTI_CLIENT: 4000,
};

export type IncomingMessageType = "game-start" | "game-action" | "lobby-update" | "renderer-ready";

export type OutgoingMessageType = keyof EventMap | "game-start" | "lobby-update" | "lobby-remove";

export type MessageType = IncomingMessageType | OutgoingMessageType;

export type IncomingMessagePayloads = {
    "game-start": null;
    "game-quit": null;
    "game-action": { action: UserInput };
    "lobby-update": { playTo: number };
    "renderer-ready": null;
};

export type OutgoingMessagePayloads = EventMap & {
    "game-start": { playerNames: string[] };
    "lobby-update": { config: PongConfig; playerNames: string[]; host: boolean };
    "lobby-remove": null;
};

export interface IncomingMessage<T extends IncomingMessageType> {
    type: T;
    payload: IncomingMessagePayloads[T];
}

export interface OutgoingMessage<T extends OutgoingMessageType> {
    type: T;
    payload: OutgoingMessagePayloads[T];
}

export type OutgoingMessageHandler<T extends OutgoingMessageType> = (
    payload: OutgoingMessagePayloads[T]
) => void;
