import { z, ZodTypeAny } from "zod";
import { FastifyRequest, FastifyReply } from "fastify";

type ZodTarget = "body" | "query" | "params" | "headers";

/**
 * Middleware to validate data for the request (params, body, query, headers) using Zod.
 * Each validated part is passed to the handler as a `data` object with named keys.
 * @param schemas - The schemas to validate the request data against.
 * @param handler - The handler function to process the validated data.
 * @returns A middleware function that validates the request data and passes it to the handler.
 */
export function withZod<Schemas extends Partial<Record<ZodTarget, ZodTypeAny>>>(
    schemas: Schemas,
    handler: (
        data: {
            [K in keyof Schemas]: Schemas[K] extends ZodTypeAny ? z.infer<Schemas[K]> : never;
        },
        req: FastifyRequest,
        reply: FastifyReply
    ) => any
) {
    return async (req: FastifyRequest, reply: FastifyReply) => {
        const parsed: Partial<Record<keyof Schemas, unknown>> = {};

        for (const key of Object.keys(schemas) as (keyof Schemas)[]) {
            const schema = schemas[key] as ZodTypeAny;
            const result = schema.safeParse(req[key as ZodTarget]);

            if (!result.success) {
                return reply.status(400).send({
                    error: "Validation failed",
                    source: key,
                    message: result.error.format(), // more user-friendly
                });
            }

            parsed[key] = result.data;
        }

        return handler(parsed as any, req, reply); // safe cast
    };
}
