import { PongEngineEventMap, UserInput } from "./pong.types";

export type IncomingMessageType = "game-start" | "action";
export type OutgoingMessageType = keyof PongEngineEventMap | "waiting-for-opponent";

export type MessageType = IncomingMessageType | OutgoingMessageType;

export type IncomingMessagePayloads = {
    "game-start": { token: string };
    action: { direction: UserInput };
};

export type OutgoingMessagePayloads = Omit<PongEngineEventMap, "game-start"> & {
    "game-start": { gameId: string; opponentId: number; index: 0 | 1 };
    "waiting-for-opponent": null;
};

export interface IncomingMessage<T extends IncomingMessageType> {
    type: T;
    payload: IncomingMessagePayloads[T];
}

export interface OutgoingMessage<T extends OutgoingMessageType> {
    type: T;
    payload: OutgoingMessagePayloads[T];
}
