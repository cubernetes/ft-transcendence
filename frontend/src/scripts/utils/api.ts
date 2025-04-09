import { Result, err, ok } from "neverthrow";

/**
 * A fetch wrapper to send JSON over request body.
 * Generic, T for request data, E for response.
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
        return ok(data); // Return a success result
    } catch (error) {
        return err(error instanceof Error ? error : new Error("Unknown error"));
    }
};
