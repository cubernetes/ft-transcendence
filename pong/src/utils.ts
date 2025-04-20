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

export const deepAssign = <T extends Record<string, any>>(
    target: T,
    source: Partial<T>,
    skipUndefined: boolean = false
): T => {
    if (!source) return target;

    for (const key of Object.keys(source)) {
        const sourceVal = source[key];

        // Skip undefined values if flag is true, perserving original
        if (skipUndefined && sourceVal === undefined) continue;

        const targetVal = target[key];

        // Check if both values are objects (but not null and not arrays)
        if (
            sourceVal !== null &&
            targetVal !== null &&
            typeof sourceVal === "object" &&
            typeof targetVal === "object" &&
            !Array.isArray(sourceVal) &&
            !Array.isArray(targetVal)
        ) {
            // Recursively merge objects
            deepAssign(targetVal, sourceVal);
        } else {
            // Replace value (including arrays or primitives)
            (target as any)[key] = sourceVal;
        }
    }

    return target;
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
