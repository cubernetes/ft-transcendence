import { z } from "zod";

export const configSchema = z.object({
    BACKEND_PORT: z.coerce
        .number({
            required_error: "cannot be empty",
            invalid_type_error: "must be a number",
        })
        .int("must be an integer")
        .min(1024, "must be greater than 1023") // Avoid privileged or reversed ports
        .max(65535, "must be less than 65536"),

    JWT_SECRET: z.string().min(32, "must be at least 32 characters long"),
    DB_PATH: z.string().min(1, "cannot be empty"),
});
