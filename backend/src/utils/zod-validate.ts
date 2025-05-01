import type { FastifyReply, FastifyRequest } from "fastify";
import { ZodError, ZodTypeAny, z } from "zod";
import { ApiError } from "./api-response.ts";

type ZodTarget = "body" | "query" | "params" | "headers";
type SchemaMap = Partial<Record<ZodTarget, ZodTypeAny>>;

type InferSchemaMap<S extends SchemaMap> = {
    [K in keyof S]: S[K] extends ZodTypeAny ? z.infer<S[K]> : never;
};

export type ZodHandler<S extends SchemaMap> = (
    data: InferSchemaMap<S>,
    req: FastifyRequest,
    reply: FastifyReply
) => Promise<void>;

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

        const summarizeZodError = (error: ZodError): string => {
            if (error.issues.length === 0) return "Validation failed";

            return error.issues.map((i) => i.message).join("; ");
        };

        for (const key of Object.keys(schemas) as (keyof Schemas)[]) {
            const schema = schemas[key] as ZodTypeAny;
            const data = req[key as ZodTarget];

            // Handle when field doesn't exist at all
            if (!data) {
                const err = new ApiError(
                    "VALIDATION_ERROR",
                    400,
                    `Missing required ${String(key)}`
                );
                err.send(reply);
            }

            const result = schema.safeParse(data);

            if (!result.success) {
                const err = new ApiError("VALIDATION_ERROR", 400, summarizeZodError(result.error));
                return err.send(reply);
            }

            parsed[key] = result.data;
        }

        return cb(parsed as InferSchemaMap<Schemas>, req, reply);
    };
