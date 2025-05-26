import { z } from "zod";

export const configSchema = z.object({
    BACKEND_PORT: z.coerce
        .number({
            invalid_type_error: "BACKEND_PORT is required", // Coerce will force to nan
        })
        .int("BACKEND_PORT must be an integer")
        .min(1024, "BACKEND_PORT must be greater than 1023") // Avoid privileged or reversed ports
        .max(65535, "BACKEND_PORT must be less than 65536"),

    JWT_SECRET: z
        .string({ required_error: "JWT_SECRET is required" })
        .min(32, "JWT_SECRET must be at least 32 characters long"),

    DB_PATH: z.string({ required_error: "DB_PATH is required" }).min(1, "DB_PATH cannot be empty"),

    API_PREFIX: z
        .string()
        .regex(
            /^\/[a-z0-9/-]*[a-z0-9]$/i,
            "API_PREFIX must start with a slash, contain only URL-safe characters, and not end with a slash"
        )
        .default("/api"),

    HOST: z.string().ip("HOST must be a valid IP address").default("0.0.0.0"),

    DOMAINS: z
        .string()
        .default("localhost")
        .transform((val) => (val ? val.split(/\s+/).filter(Boolean) : []))
        .refine(
            (arr) => arr.every(isValidDomain),
            "each domain must be a valid domain or 'localhost'"
        ),
});

// https://github.com/colinhacks/zod/pull/3692
const isValidDomain = (val: string): boolean =>
    val === "localhost" || /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i.test(val);
