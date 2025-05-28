import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { apiError, apiSuccess, lobbySchema } from "@darrenkuro/pong-core";

const create = {
    tags: ["Lobby"],
    description: "Create a new lobby",
    security: [{ cookieAuth: [] }],
    response: {
        201: zodToJsonSchema(apiSuccess(lobbySchema.createPayload)),
        409: zodToJsonSchema(apiError("ALREADY_IN_LOBBY")),
        500: zodToJsonSchema(apiError("SERVER_ERROR")),
    },
};

const join = {
    tags: ["Lobby"],
    description: "Join a lobby",
    params: zodToJsonSchema(lobbySchema.joinParams),
    security: [{ cookieAuth: [] }],
    response: {
        201: zodToJsonSchema(apiSuccess(z.object({}))),
        400: zodToJsonSchema(apiError("VALIDATION_ERROR")),
        401: zodToJsonSchema(apiError("UNAUTHORIZED")),
        404: zodToJsonSchema(apiError("LOBBY_NOT_FOUND")),
        409: zodToJsonSchema(z.union([apiError("ALREADY_IN_LOBBY"), apiError("LOBBY_FULL")])),
        500: zodToJsonSchema(apiError("SERVER_ERROR")),
    },
};

const update = {
    tags: ["Lobby"],
    description: "Update the config of a lobby",
    body: zodToJsonSchema(lobbySchema.updateBody),
    security: [{ cookieAuth: [] }],
    response: {
        200: zodToJsonSchema(apiSuccess(z.object({}))),
        400: zodToJsonSchema(z.union([apiError("VALIDATION_ERROR"), apiError("NOT_IN_LOBBY")])),
        401: zodToJsonSchema(apiError("UNAUTHORIZED")),
        500: zodToJsonSchema(z.union([apiError("SERVER_ERROR"), apiError("CORRUPTED_DATA")])),
    },
};

const leave = {
    tags: ["Lobby"],
    description: "Leave a lobby",
    security: [{ cookieAuth: [] }],
    response: {
        200: zodToJsonSchema(apiSuccess(z.object({}))),
        400: zodToJsonSchema(apiError("NOT_IN_LOBBY")),
        401: zodToJsonSchema(apiError("UNAUTHORIZED")),
        500: zodToJsonSchema(z.union([apiError("SERVER_ERROR"), apiError("CORRUPTED_DATA")])),
    },
};

export const routeSchema = { create, join, update, leave };
