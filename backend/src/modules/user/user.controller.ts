import type { PublicUser } from "@darrenkuro/pong-core";
import type { FastifyInstance, RouteHandlerMethod } from "fastify";
import { userSchemas } from "@darrenkuro/pong-core";
import { ZodHandler } from "../../utils/zod-validate.ts";

export const createUserController = (app: FastifyInstance) => {
    type RegisterCb = ZodHandler<{ body: typeof userSchemas.registerBody }>;
    const register: RegisterCb = async ({ body }, _, reply) => {
        // Remove password fields from user data
        const { confirmPassword, password, ...userData } = body;

        // Generate and add password hash to user data
        const passwordHash = await app.authService.hashPassword(password);
        const userWithHash = { ...userData, passwordHash };

        // Try create user in database, send back error if failed
        const tryCreateUser = await app.userService.create(userWithHash);
        if (tryCreateUser.isErr()) return reply.err(tryCreateUser.error);

        // Generate JWT token and send back as cookies
        const user = tryCreateUser.value;
        const token = app.authService.generateJwtToken(user);
        const { username, displayName } = user;

        reply.ok({ username, displayName }, 201, { token });
    };

    type LoginCb = ZodHandler<{ body: typeof userSchemas.loginBody }>;
    const login: LoginCb = async ({ body }, _, reply) => {
        const { username, password, totpToken } = body;

        // Try to find user with username provided, send back error if failed
        const tryGetUser = await app.userService.findByUsername(username);
        if (tryGetUser.isErr()) return reply.err(tryGetUser.error);

        const user = tryGetUser.value;
        const { displayName, totpEnabled, totpSecret, passwordHash } = user;

        // Validate password, send back 401 error if failed
        const verifyPassword = await app.authService.comparePassword(password, passwordHash);
        if (!verifyPassword) return reply.err("PASSWORD_INVALID");

        // Check 2FA
        if (totpEnabled) {
            // 2FA enabled but have yet to receive token, send back totp request
            if (!totpToken) return reply.ok({ totpEnabled });

            // 2FA enabled but no TOTP secret in database, should never happen in theory
            if (!totpSecret) return reply.err("SERVER_ERROR");

            // Verify TOTP token
            const verifyToken = app.authService.verifyTotpToken(totpSecret, totpToken);
            if (!verifyToken) return reply.err("TOKEN_INVALID");
        }

        // Password and 2FA have been verified, send cookies
        const token = app.authService.generateJwtToken(user);

        reply.ok({ username, displayName }, 200, { token });
    };

    const logout: RouteHandlerMethod = async (_, reply) => {
        const { cookieName } = app.config;
        reply.clearCookie(cookieName);

        reply.ok({});
    };

    type LeaderboardCb = ZodHandler<{ params: typeof userSchemas.leaderboardParams }>;
    const leaderboard: LeaderboardCb = async ({ params }, _, reply) => {
        // Get number of users requested from params
        const { n } = params;

        // Fetch all users from database, send back error if failed
        const tryGetUsers = await app.userService.findAll();
        if (tryGetUsers.isErr()) return reply.err(tryGetUsers.error);

        // Map each user to public user data
        const publicUsers: PublicUser[] = [];
        for (const user of tryGetUsers.value) {
            const tryMapUser = await app.userService.toPublicUser(user);

            // If any user is failing for whatever reason, stop and send back error
            if (tryMapUser.isErr()) return reply.err(tryMapUser.error);

            publicUsers.push(tryMapUser.value);
        }

        // Sort by rank, then get the first n users
        const data = publicUsers.sort((a, b) => a.rank - b.rank).slice(0, n);
        reply.ok(data);
    };

    type InfoCb = ZodHandler<{ params: typeof userSchemas.infoParams }>;
    const info: InfoCb = async ({ params }, _, reply) => {
        const { username } = params;

        // Try to find user with username provided, send back error if failed
        const tryGetUser = await app.userService.findByUsername(username);
        if (tryGetUser.isErr()) return reply.err(tryGetUser.error);

        // Try to map user to public user data, send back error if failed
        const tryMapUser = await app.userService.toPublicUser(tryGetUser.value);
        if (tryMapUser.isErr()) return reply.err(tryMapUser.error);

        reply.ok(tryMapUser.value);
    };

    const me: RouteHandlerMethod = async (req, reply) => {
        const { username } = req;

        // Try to find user with username provided, send back error if failed
        const tryGetUser = await app.userService.findByUsername(username);
        if (tryGetUser.isErr()) return reply.err(tryGetUser.error);

        // Try to map user to personal user data, send back error if failed
        const tryMapUser = await app.userService.toPersonalUser(tryGetUser.value);
        if (tryMapUser.isErr()) return reply.err(tryMapUser.error);

        reply.ok(tryMapUser.value);
    };

    const avatar: RouteHandlerMethod = async (req, reply) => {
        const app = req.server;

        const data = await req.file();

        if (!data) return; //TODO: fill in; this validation should be done with zod or something at a higher level?

        const tryUpload = await app.userService.upload(data, req.username);
        if (tryUpload.isErr()) return reply.err(tryUpload.error);

        const avatarUrl = tryUpload.value.replace("frontend/dist/", ""); // TODO: clean up
        app.log.debug(`avatar URL: ${tryUpload.value}`);
        await app.userService.update(req.userId, { avatarUrl });

        reply.ok({ avatarUrl });
    };

    return { register, login, logout, leaderboard, info, me, avatar };
};
