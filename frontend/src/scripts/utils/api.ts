import { Result, err, ok } from "neverthrow";
import { ApiResponse } from "@darrenkuro/pong-core";
import { logout } from "../modules/auth/auth.service";

/**
 * A generic fetch wrapper to send JSON over request body.
 * Jwt Token will be automtically attached.
 * @template T,E T: RequestBody, E: ResponseJSON
 */
const post = async <T, E extends ApiResponse<any>>(
    url: string,
    body?: T
): Promise<Result<E, Error>> => {
    try {
        const headers: HeadersInit = { "Content-Type": "application/json" };
        const token = localStorage.getItem(window.cfg.label.token);
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            method: "POST",
            headers,
            body: body ? JSON.stringify(body) : undefined,
            credentials: "include", // Needed when switch to HttpCookies in the future
        });

        // Code 401 means token invalid, log out user
        if (response.status === 401) {
            logout();
        }

        if (!response.ok) {
            const message = `POST to ${url}, response not ok, status: ${response.status}`;
            window.log.debug(message);
            return err(new Error(message));
        }

        const data: E = await response.json();
        if (!data.success) {
            window.log.debug(`POST to ${url}: ${data.error.code}`);
            return err(new Error(data.error.message));
        }

        return ok(data);
    } catch (error) {
        return err(
            new Error(`POST to ${url}: ${error instanceof Error ? error.message : "unknown error"}`)
        );
    }
};

const get = async <T extends ApiResponse<any>>(url: string): Promise<Result<T, Error>> => {
    try {
        const token = localStorage.getItem(window.cfg.label.token);

        const response = await fetch(url, {
            method: "GET",
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        // Code 401 means token invalid, log out user
        if (response.status === 401) {
            logout();
        }

        if (!response.ok) {
            const msg = `GET to ${url}, response not ok, status: ${response.status}`;
            window.log.debug(msg);
            return err(new Error(msg));
        }

        const data: T = await response.json();
        if (!data.success) {
            window.log.debug(`GET to ${url}: ${data.error.code}`);
            return err(new Error(data.error.message));
        }

        return ok(data);
    } catch (error) {
        return err(
            new Error(`GET to ${url}: ${error instanceof Error ? error.message : "unknown error"}`)
        );
    }
};

export const sendApiRequest = { get, post };
