import fp from "fastify-plugin";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";

const swaggerPlugin = async (fastify: FastifyInstance) => {
    await fastify.register(swagger, {
        openapi: {
            info: {
                title: "Example API",
                description: "API docs for service endpoints",
                version: "1.0.0",
            },
            servers: [
                {
                    url: "/api",
                    description: "API behind Caddy reverse proxy",
                },
            ],
        },
    });

    await fastify.register(swaggerUI, {
        routePrefix: "/docs/", // Trailing slash is required here
        uiConfig: {
            docExpansion: "list",
            deepLinking: false,
        },
        staticCSP: true,
        transformStaticCSP: (header) => {
            return header.replace("style-src 'self'", "style-src 'self' 'unsafe-inline'");
        }, // Required to allow inline styles for client to not print errors in console
    });

    // TODO: Maybe remove hardcoded /api path here
    fastify.get("/docs", { schema: { hide: true } }, async (_, reply) => {
        reply.redirect("/api/docs/"); // Redirect to the correct path
    });
};

export default fp(swaggerPlugin, { name: "swagger-plugin" });
