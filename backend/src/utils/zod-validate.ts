import type { FastifyReply, FastifyRequest } from "fastify";
import { ZodTypeAny, z } from "zod";
import { ErrorCode, errorCodeEnum } from "@darrenkuro/pong-core";

type ZodTarget = "body" | "query" | "params" | "headers";
type SchemaMap = Partial<Record<ZodTarget, ZodTypeAny>>;

type InferSchemaMap<S extends SchemaMap> = {
    [K in keyof S]: S[K] extends ZodTypeAny ? z.infer<S[K]> : never;
};

export type ZodHandler<S extends SchemaMap> = (
    data: InferSchemaMap<S>,
    req: FastifyRequest,
    reply: FastifyReply
) => void | Promise<void>;

const isValidError = (v: unknown): v is ErrorCode => errorCodeEnum.safeParse(v).success;

/**
 * Middleware to validate data for the request (params, body, query, headers) using Zod.
 * Each validated part is passed to the handler as a `data` object with named keys.
 * @param schemas - The schemas to validate the request data against.
 * @param handler - The handler function to process the validated data.
 * @returns A middleware function that validates the request data and passes it to the handler.
 */
export const withZod =
    <Schemas extends SchemaMap>(schemas: Schemas, cb: ZodHandler<Schemas>) =>
    async (req: FastifyRequest, reply: FastifyReply) => {
        const parsed: Partial<Record<keyof Schemas, unknown>> = {};

        for (const key of Object.keys(schemas) as (keyof Schemas)[]) {
            const schema = schemas[key] as ZodTypeAny;
            const data = req[key as ZodTarget];

            // Handle when field doesn't exist at all, should never happen
            if (!data) return reply.err("VALIDATION_ERROR");

            const res = schema.safeParse(data);

            if (!res.success) {
                // Only return the first issue
                const msg = res.error.issues[0].message;

                // Potential extra fields due to strict
                return reply.err(isValidError(msg) ? msg : "VALIDATION_ERROR");
            }

            parsed[key] = res.data;
        }

        return cb(parsed as InferSchemaMap<Schemas>, req, reply);
    };
