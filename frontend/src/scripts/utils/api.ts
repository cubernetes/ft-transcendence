import { Result, err, ok } from "neverthrow";
import { ApiResponse, ErrorCode, defaultGameConfig } from "@darrenkuro/pong-core";
import { logout } from "../modules/auth/auth.service";

/**
 * A generic fetch wrapper to send JSON over request body.
 * Jwt Token will be automtically attached.
 * @template T,E T: RequestBody, E: ResponseJSON
 */
const post = async <T, E extends ApiResponse<any>>(
    url: string,
    body?: T
): Promise<Result<E, ErrorCode>> => {
    try {
        const init: RequestInit = {
            method: "POST",
            credentials: "include", // Cookies
        };

        if (body) {
            if (typeof FormData && body instanceof FormData) {
                init.body = body;
            } else {
                init.body = JSON.stringify(body);
                init.headers = { "Content-Type": "application/json" };
            }
        }

        const response = await fetch(url, init);

        const data: E = await response.json();
        log.debug(data);

        if (!data.success) {
            log.debug(`POST to ${url}: ${response.status} ${data.error.code}`);
            return err(data.error.code);
        }

        return ok(data);
    } catch (error) {
        log.error(`POST to ${url}: ${error instanceof Error ? error.message : "unknown error"}`);
        return err("UNKNOWN_ERROR");
    }
};

const get = async <T extends ApiResponse<any>>(url: string): Promise<Result<T, ErrorCode>> => {
    try {
        const response = await fetch(url, {
            method: "GET",
            credentials: "include", // Cookies
        });

        const data: T = await response.json();
        log.debug(data);

        if (!data.success) {
            log.debug(`GET ${url}: ${response.status} ${data.error.code}`);
            return err(data.error.code);
        }

        return ok(data);
    } catch (error) {
        log.error(`POST to ${url}: ${error instanceof Error ? error.message : "unknown error"}`);
        return err("UNKNOWN_ERROR");
    }
};

export const sendApiRequest = { get, post };
