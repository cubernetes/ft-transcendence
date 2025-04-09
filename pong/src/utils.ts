import { Result, err, ok } from "neverthrow";

/** Safely parse a string to JSON and return a Result. */
export const safeJsonParse = <T>(text: string): Result<T, Error> => {
    try {
        const parsedData: T = JSON.parse(text);
        return ok(parsedData);
    } catch (error) {
        return err(new Error("Invalid JSON format"));
    }
};
