export type IncomingMessageType = "auth" | "local-game" | "remote-game";
export type OutgoingMessageType = "game-start" | "game-end" | "waiting-for-opponent";

export type MessageType = IncomingMessageType | OutgoingMessageType;

export interface Message {
    type: MessageType;
    payload: any;
}

export interface IncomingMessage extends Message {
    type: IncomingMessageType;
}

export interface OutgoingMessage extends Message {
    type: OutgoingMessageType;
}

export type LocalGamePayload = {
    action: "up" | "down" | "stop"; // Maybe add start, pause, resume, etc
    index: 0 | 1; // Player index 0 left, 1 right
};

export interface LocalGameMessage extends IncomingMessage {
    type: "local-game";
    payload: LocalGamePayload;
}

// TODO: Don't auth for right now but will need to later
export type RemoteGamePayload = {
    action: "up" | "down" | "stop"; // Maybe add start, pause, resume, etc
};

export interface RemoteGameMessage extends IncomingMessage {
    type: "remote-game";
    payload: RemoteGamePayload;
}

export type GameStartPayload = {
    gameId: string;
    opponentId: number;
};

export interface GameStartMessage extends OutgoingMessage {
    type: "game-start";
    payload: GameStartPayload;
}

export interface WaitingForOpponentMessage extends OutgoingMessage {
    type: "waiting-for-opponent";
    payload: null;
}
