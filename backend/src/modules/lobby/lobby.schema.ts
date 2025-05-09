import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { apiError, apiSuccess, lobbySchemas } from "@darrenkuro/pong-core";

// TODO: create the correct errors
const create = {
    tags: ["Lobby"],
    description: "Create a new lobby",
    security: [{ cookieAuth: [] }],
    response: {
        201: zodToJsonSchema(apiSuccess(lobbySchemas.createPayload)),
        500: zodToJsonSchema(apiError("SERVER_ERROR")),
    },
};

const join = {
    tags: ["Lobby"],
    description: "Join a lobby",
    params: zodToJsonSchema(lobbySchemas.joinParams),
    security: [{ cookieAuth: [] }],
    response: {
        201: zodToJsonSchema(apiSuccess(z.object({}))),
        500: zodToJsonSchema(apiError("SERVER_ERROR")),
    },
};

const update = {
    tags: ["Lobby"],
    description: "Update the config of a lobby",
    body: zodToJsonSchema(lobbySchemas.updateBody),
    security: [{ cookieAuth: [] }],
    response: {
        200: zodToJsonSchema(apiSuccess(z.object({}))),
        // 401: zodToJsonSchema(apiError("UNAUTHORIZED")),
        500: zodToJsonSchema(apiError("SERVER_ERROR")),
    },
};

const leave = {
    tags: ["Lobby"],
    description: "Leave a lobby",
    security: [{ cookieAuth: [] }],
    response: {
        200: zodToJsonSchema(apiSuccess(z.object({}))),
        500: zodToJsonSchema(apiError("SERVER_ERROR")),
    },
};

export default { create, join, update, leave };
