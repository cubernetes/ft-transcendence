import { Result, err, ok } from "neverthrow";

/**
 * A generic fetch wrapper to send JSON over request body.
 * @template T,E T: RequestBody, E: ResponseJSON
 */
export const postWithBody = async <T, E>(url: string, body: T): Promise<Result<E, Error>> => {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const msg = `POST error to ${url}, status: ${response.status}`;
            window.log.debug(msg);
            return err(new Error(msg));
        }

        const data: E = await response.json();

        return ok(data);
    } catch (error) {
        return err(error instanceof Error ? error : new Error("Unknown error"));
    }
};
