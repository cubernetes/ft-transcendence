import { Result, err, ok } from "neverthrow";
import {
    IncomingMessageHandler,
    IncomingMessageType,
    OutgoingMessageHandler,
    OutgoingMessageType,
} from "./types/types.ws";

/** Safely parse a string to JSON and return a Result. */
export const safeJsonParse = <T>(text: string): Result<T, Error> => {
    try {
        const parsedData: T = JSON.parse(text);
        return ok(parsedData);
    } catch (error) {
        return err(new Error("Invalid JSON format"));
    }
};

/** Properly typed outgoing message handler register. */
export const registerOutgoingMessageHandler = <T extends OutgoingMessageType>(
    type: T,
    handler: OutgoingMessageHandler<T>,
    handlers: Map<OutgoingMessageType, OutgoingMessageHandler<OutgoingMessageType>>
): void => {
    handlers.set(type, handler as OutgoingMessageHandler<OutgoingMessageType>);
};

/** Properly typed incoming message handler register. */
export const registerIncomingMessageHandler = <T extends IncomingMessageType>(
    type: T,
    handler: IncomingMessageHandler<T>,
    handlers: Map<IncomingMessageType, IncomingMessageHandler<IncomingMessageType>>
): void => {
    handlers.set(type, handler as IncomingMessageHandler<IncomingMessageType>);
};
