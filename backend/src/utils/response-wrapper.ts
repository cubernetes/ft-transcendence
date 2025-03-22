import fp from "fastify-plugin";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { ApiError } from "./errors";

export type ResSuccess<T> = {
    success: true;
    data: T;
};

export type ResError = {
    success: false;
    error: { message: string; code: string };
};

export const resSuccess = <T extends z.ZodTypeAny>(data: T) =>
    z.object({
        success: z.literal(true),
        data,
    });

export const resError = <T extends [string, ...string[]]>(codes: T) =>
    z.object({
        success: z.literal(false),
        error: z.object({
            message: z.string(),
            code: z.enum(codes),
        }),
    });

export type ApiResponse<T> = ResSuccess<T> | ResError;

/** Will be trigger for any error thrown, shouldn't catch them */
const errorHandler = async (err: unknown, req: FastifyRequest, reply: FastifyReply) => {
    if (err instanceof ApiError) {
        return reply.status(err.statusCode).send({
            success: false,
            error: { message: err.message, code: err.code },
        });
    }

    /** Catch-all internal error */
    req.log.error({ err }, "Unhandled error");

    return reply.status(500).send({
        success: false,
        error: {
            message: "Internal Server Error",
            code: "INTERNAL_ERROR",
        },
    });
};

const onSendHandler = async (req: FastifyRequest, reply: FastifyReply, payload: any) => {
    const contentType = reply.getHeader("content-type")?.toString().toLowerCase().trim() || "";
    const url = req.url ?? "";
    const skipPrefixes = ["/docs", "/healthcheck"];

    const isJson = contentType.includes("application/json");
    const isSuccess = reply.statusCode >= 200 && reply.statusCode < 300;
    const shouldSkip = !isJson || skipPrefixes.some((prefix) => url.startsWith(prefix));

    if (shouldSkip) return payload;

    if (isSuccess && typeof payload === "string") {
        try {
            const parsed = JSON.parse(payload);

            /** Wrap only if not already wrapped */
            const alreadyWrapped = parsed?.success === true && "data" in parsed;
            if (!alreadyWrapped) {
                return JSON.stringify({ success: true, data: parsed });
            }
        } catch {
            /** Not valid JSON, don't touch it */
            req.server.log.warn({ payload }, "Invalid JSON payload on onSend handler");
        }
    }
    return payload;
};

const resWrapperPlugin = async (fastify: FastifyInstance) => {
    fastify.setErrorHandler(errorHandler);
    fastify.addHook("onSend", onSendHandler);
};

export default fp(resWrapperPlugin, {
    name: "res-wrapper-plugin",
});
