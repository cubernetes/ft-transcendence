import { Result, err, ok } from "neverthrow";

/**
 * A generic fetch wrapper to send JSON over request body.
 * @template T,E T: RequestBody, E: ResponseJSON
 */
export const postWithBody = async <T, E>(url: string, body: T): Promise<Result<E, Error>> => {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization:
                    "Bearer " + localStorage.getItem(window.cfg.label.token) || "Unauthorized",
            },
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

export const getWrapper = async <T>(url: string): Promise<Result<T, Error>> => {
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization:
                    "Bearer " + localStorage.getItem(window.cfg.label.token) || "Unauthorized",
            },
        });

        if (!response.ok) {
            const msg = `GET error to ${url}, status: ${response.status}`;
            window.log.debug(msg);
            return err(new Error(msg));
        }

        const data: T = await response.json();

        return ok(data);
    } catch (error) {
        return err(error instanceof Error ? error : new Error("Unknown error"));
    }
};
