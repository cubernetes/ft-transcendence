import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import fastify, {
    FastifyInstance,
    FastifyReply,
    FastifyRequest,
    FastifyServerOptions,
} from "fastify";
import configPlugin from "./config.ts";
import swaggerPlugin from "./swagger.ts";
import dbPlugin from "../db/db.plugin.ts";
import wsPlugin from "../ws/ws.plugin.ts";
import resWrapperPlugin from "./response-wrapper.ts";
import authPlugin from "../auth/auth.plugin.ts";
import userPlugin from "../user/user.plugin.ts";
import gamePlugin from "../game/game.plugin.ts";
import tournamentPlugin from "../tournament/tournament.plugin.ts";
import { seed } from "../db/db.seed.ts";

export const buildApp = async (
    opts: FastifyServerOptions,
    test: boolean = false
): Promise<FastifyInstance> => {
    const app = fastify(opts);
    app.setValidatorCompiler(() => () => true); // Disable ajv validation

    try {
        /** Register configs, check integrity of the env variables */
        await app.register(configPlugin);

        /** Register CORS */
        // TODO: When in production what should the origin be? SITES? are env vars loaded?
        await app.register(cors, {
            origin: process.env.NODE_ENV === "production" ? "placeholder" : "*",
        });

        // TODO: Add more options here for JWT, see: https://github.com/fastify/fastify-jwt
        await app.register(jwt, { secret: app.config.jwtSecret }); // Register jwt plugin

        if (process.env.NODE_ENV !== "production") {
            await app.register(swaggerPlugin); // Register swagger plugin
        }

        await app.register(dbPlugin); // Register database plugin
        await app.register(wsPlugin); // Register websocket plugin
        await app.register(authPlugin); // Register auth plugin
        await app.register(resWrapperPlugin); // Register response wrapper plugin
        await app.register(userPlugin); // Register user plugin
        await app.register(gamePlugin); // Register game plugin
        await app.register(tournamentPlugin); // Register tournament plugin

        app.get("/healthcheck", async (_: FastifyRequest, reply: FastifyReply) => {
            return reply.status(200).send({ status: "ok" });
        });

        if (!test) {
            /** Seed database if not in production */
            if (process.env.NODE_ENV !== "production") {
                await seed(app);
            }
            /** Start server not needed in test mode with tap*/
            await app.listen({ port: app.config.port, host: "0.0.0.0" });
            app.log.info(`Server running at port ${app.config.port}!`);
        }

        return app;
    } catch (error) {
        /** Safely close the server, trigger all onClose hooks */
        app.close();
        app.log.error({ err: error }, "Failed to start server");
        throw error;
    }
};
