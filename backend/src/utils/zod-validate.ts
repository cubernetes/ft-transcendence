import { z, ZodTypeAny } from "zod";
import { FastifyRequest, FastifyReply } from "fastify";

type ZodTarget = "body" | "query" | "params" | "headers";
type SchemaMap = Partial<Record<ZodTarget, ZodTypeAny>>;

type InferSchemaMap<S extends SchemaMap> = {
    [K in keyof S]: S[K] extends ZodTypeAny ? z.infer<S[K]> : never;
};

type ZodHandler<S extends SchemaMap> = (
    data: InferSchemaMap<S>,
    req: FastifyRequest,
    reply: FastifyReply
) => unknown | Promise<unknown>;

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
            const result = schema.safeParse(req[key as ZodTarget]);

            // Maybe validate one field at a time or all together
            // TODO: Change what to send for validation failure? Depends on needs
            if (!result.success) {
                return reply.status(400).send({
                    error: "Validation failed",
                    source: key,
                    message: result.error.format(),
                });
            }

            parsed[key] = result.data;
        }

        return cb(parsed as any, req, reply); // Safe cast to any
    };
