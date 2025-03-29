export type IncomingMessageType = "game-start" | "action";
export type OutgoingMessageType = "game-start" | "game-end" | "waiting-for-opponent";

export type MessageType = IncomingMessageType | OutgoingMessageType;

export interface IncomingMessagePayloads {
    "game-start": { token: string };
    action: { direction: "up" | "down" | "stop" }; // Get this from somewhere too
}

export interface OutgoingMessagePayloads {
    "game-start": { gameId: string; opponentId: number };
    "game-end": { winner: number };
    "waiting-for-opponent": null;
}

export interface IncomingMessage<T extends IncomingMessageType> {
    type: T;
    payload: IncomingMessagePayloads[T];
}

export interface OutgoingMessage<T extends OutgoingMessageType> {
    type: T;
    payload: OutgoingMessagePayloads[T];
}
