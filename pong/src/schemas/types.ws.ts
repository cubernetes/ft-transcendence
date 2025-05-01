import { PongConfig, PongEngineEventMap, UserInput } from "../pong/pong.types";

export type IncomingMessageType =
    | "lobby-create"
    | "lobby-join"
    | "lobby-update-config"
    | "lobby-leave"
    | "game-start"
    | "game-action";

export type OutgoingMessageType =
    | keyof PongEngineEventMap
    | "lobby-created"
    | "lobby-joined"
    | "lobby-updated"
    | "game-started";

export type MessageType = IncomingMessageType | OutgoingMessageType;

export type IncomingMessagePayloads = {
    "lobby-create": { config: PongConfig };
    "lobby-join": { lobbyId: string };
    "lobby-update-config": { config: PongConfig };
    "lobby-leave": null;
    "game-start": null;
    "game-action": { action: UserInput };
};

export type OutgoingMessagePayloads = PongEngineEventMap & {
    "lobby-created": { lobbyId: string };
    "lobby-joined": { config: PongConfig; playerNames: string[] };
    "lobby-updated": { config: PongConfig; playerNames: string[] };
    "game-started": {
        playerNames: [string, string];
    };
};

export interface IncomingMessage<T extends IncomingMessageType> {
    type: T;
    payload: IncomingMessagePayloads[T];
}

export interface OutgoingMessage<T extends OutgoingMessageType> {
    type: T;
    payload: OutgoingMessagePayloads[T];
}

export type IncomingMessageHandler<T extends IncomingMessageType> = (
    payload: IncomingMessagePayloads[T]
) => void;

export type OutgoingMessageHandler<T extends OutgoingMessageType> = (
    payload: OutgoingMessagePayloads[T]
) => void;
