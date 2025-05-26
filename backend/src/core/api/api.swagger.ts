import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";

const plugin = async (app: FastifyInstance) => {
    const { apiPrefix, cookieName } = app.config;

    const info = {
        title: "Example API",
        description: "API docs for service endpoints",
        version: "1.0.0",
    };

    const servers = [
        {
            url: apiPrefix,
            description: "API behind Caddy reverse proxy",
        },
    ];

    const components = {
        securitySchemes: {
            cookieAuth: {
                type: "apiKey" as const,
                in: "cookie",
                name: cookieName,
            },
        },
    };

    await app.register(swagger, { openapi: { info, servers, components } });

    await app.register(swaggerUI, {
        // Trailing slash is automatically added here
        routePrefix: "/docs/",
        uiConfig: { docExpansion: "list", deepLinking: false },

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

export const swaggerPlugin = fp(plugin, {
    name: "swagger-plugin",
    dependencies: ["config-plugin"],
});
