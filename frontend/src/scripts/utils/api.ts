import { Result, err, ok } from "neverthrow";
import { ApiResponse, ErrorCode, GetMePayload, safeJsonParse } from "@darrenkuro/pong-core";

export const fetchPlayerData = async (): Promise<Result<GetMePayload, ErrorCode>> => {
    const tryFetch = await sendApiRequest.get<GetMePayload>(CONST.API.ME);
    if (tryFetch.isErr()) return err(tryFetch.error);

    return ok(tryFetch.value);
};

/**
 * A generic fetch wrapper to send JSON over request body.
 * Jwt Token will be automtically attached.
 * @template T,E T: Request body, E: Response payload
 */
const post = async <T, E>(url: string, body?: T): Promise<Result<E, ErrorCode>> => {
    try {
        const init: RequestInit = {
            method: "POST",
            credentials: "include", // Cookies
        };

        if (body) {
            if (typeof FormData !== "undefined" && body instanceof FormData) {
                init.body = body;
            } else {
                init.body = JSON.stringify(body);
                init.headers = { "Content-Type": "application/json" };
            }
        }

        const res = await fetch(url, init);
        const tryParsePayload = await safeJsonParse(res);
        if (tryParsePayload.isErr()) return err("CORRUPTED_DATA");

        const payload = tryParsePayload.value as ApiResponse<any>;

        if (!payload.success) {
            log.debug(`POST to ${url}: ${res.status} ${payload.error.code}`);
            return err(payload.error.code);
        }

        return ok(payload.data as E);
    } catch (error) {
        log.error(`POST to ${url}: ${error instanceof Error ? error.message : "unknown error"}`);
        return err("UNKNOWN_ERROR");
    }
};

const get = async <T>(url: string): Promise<Result<T, ErrorCode>> => {
    try {
        const res = await fetch(url, {
            method: "GET",
            credentials: "include", // Cookies
        });

        const tryParsePayload = await safeJsonParse(res);
        if (tryParsePayload.isErr()) return err("CORRUPTED_DATA");

        const payload = tryParsePayload.value as ApiResponse<any>;

        if (!payload.success) {
            log.debug(`GET ${url}: ${res.status} ${payload.error.code}`);
            return err(payload.error.code);
        }

        return ok(payload.data as T);
    } catch (error) {
        log.error(`POST to ${url}: ${error instanceof Error ? error.message : "unknown error"}`);
        return err("UNKNOWN_ERROR");
    }
};

export const sendApiRequest = { get, post };
