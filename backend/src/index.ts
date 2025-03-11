import { buildApp } from "./utils/app";
import { appOpts } from "./utils/config";

try {
    await buildApp(appOpts);
} catch (error) {
    /** No need to log error because it's extremely likely to be logged by Fastify */
    process.exit(1);
}
