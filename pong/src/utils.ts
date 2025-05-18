import { Result, err, ok } from "neverthrow";
import { ErrorCode } from "./schemas/schemas.api";

/** Safely parse a string or a fetch response to JSON and return a Result. */
export const safeJsonParse = async <T>(input: string | Response): Promise<Result<T, ErrorCode>> => {
    const isRes = (val: unknown): val is Response =>
        typeof Response !== "undefined" && val instanceof Response;

    try {
        const parsedData: T = isRes(input) ? await input.json() : JSON.parse(input);
        return ok(parsedData);
    } catch (error) {
        return err("CORRUPTED_DATA");
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
