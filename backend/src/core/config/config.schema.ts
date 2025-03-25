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
});
