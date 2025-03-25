import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";

const swaggerPlugin = async (app: FastifyInstance) => {
    const { apiPrefix } = app.config;

    await app.register(swagger, {
        openapi: {
            info: {
                title: "Example API",
                description: "API docs for service endpoints",
                version: "1.0.0",
            },
            servers: [
                {
                    url: apiPrefix,
                    description: "API behind Caddy reverse proxy",
                },
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: "http",
                        scheme: "bearer",
                        bearerFormat: "JWT",
                    },
                },
            },
        },
    });

    await app.register(swaggerUI, {
        // Trailing slash is automatically added here
        routePrefix: "/docs/",
        uiConfig: {
            docExpansion: "list",
            deepLinking: false,
        },
        // Required to allow inline styles for client to not print errors in console
        staticCSP: true,
        transformStaticCSP: (header) => {
            return header.replace("style-src 'self'", "style-src 'self' 'unsafe-inline'");
        },
    });

    // Redirect docs without trailing slash to the correct path
    app.get("/docs", { schema: { hide: true } }, async (_, reply) => {
        reply.redirect(`${apiPrefix}/docs/`);
    });
};

export default fp(swaggerPlugin, { name: "swagger-plugin", dependencies: ["config-plugin"] });
