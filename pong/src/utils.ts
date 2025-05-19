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

const isPlainObj = (v: unknown): v is Record<string, any> =>
    typeof v === "object" && v !== null && !Array.isArray(v);

export const deepAssign = <T extends Record<string, any>>(
    target: T,
    src: Partial<T>,
    skipUndefined: boolean = false
): T => {
    if (!src) return target;

    for (const [key, srcVal] of Object.entries(src)) {
        // Skip undefined values if flag is true, perserving original
        if (skipUndefined && srcVal === undefined) continue;

        const targetVal = target[key as keyof T];

        // Check if both values are objects (but not null and not arrays)
        if (isPlainObj(srcVal) && isPlainObj(targetVal)) {
            // Recursively merge objects
            deepAssign(targetVal as Record<string, any>, srcVal, skipUndefined);
        } else {
            // Replace value (including arrays or primitives)
            (target as any)[key] = srcVal;
        }
    }

    return target;
};
