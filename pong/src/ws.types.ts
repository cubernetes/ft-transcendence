import { PongEngineEventMap, UserInput } from "./pong.types";

export type IncomingMessageType = "game-start" | "game-action";
export type OutgoingMessageType = keyof PongEngineEventMap | "waiting-for-opponent";

export type MessageType = IncomingMessageType | OutgoingMessageType;

export type IncomingMessagePayloads = {
    "game-start": { 
		token: string;
		playAgainstAI?: boolean;
        aiDifficulty?: "EASY" | "MEDIUM" | "HARD"; 
	};
    "game-action": { gameId: string; index: number; action: UserInput };
};

export type OutgoingMessagePayloads = Omit<PongEngineEventMap, "game-start"> & {
    "game-start": { 
		gameId: string;
		opponentId: number;
		index: 0 | 1 ;
		isAI?: boolean;
		aiDifficulty?: string;
	};
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
