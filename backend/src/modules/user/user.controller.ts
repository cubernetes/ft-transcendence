import type {
    GetInfoPayload,
    GetMePayload,
    LeaderboardPayload,
    LoginPayload,
    PublicUser,
} from "@darrenkuro/pong-core";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { userSchemas } from "@darrenkuro/pong-core";
import { ApiSuccess, ServerError, UnauthorizedError } from "../../utils/api-response.ts";
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
        if (tryCreateUser.isErr()) return tryCreateUser.error.send(reply);

        // Generate JWT token and send back as cookies
        const user = tryCreateUser.value;
        const token = app.authService.generateJwtToken(user);
        const { username, displayName } = user;
        const data = { username, displayName };

        return new ApiSuccess<LoginPayload>(data, 201).sendWithCookie(reply, token, app);
    };

    type LoginCb = ZodHandler<{ body: typeof userSchemas.loginBody }>;
    const login: LoginCb = async ({ body }, _, reply) => {
        const { username, password, totpToken } = body;

        // Try to find user with username provided, send back error if failed
        const tryGetUser = await app.userService.findByUsername(username);
        if (tryGetUser.isErr()) return tryGetUser.error.send(reply);

        const user = tryGetUser.value;
        const { displayName, totpEnabled, totpSecret, passwordHash } = user;

        // Validate password, send back 401 error if failed
        const verifyPassword = await app.authService.comparePassword(password, passwordHash);
        if (!verifyPassword) return new UnauthorizedError("Invalid password").send(reply);

        // Check 2FA
        if (totpEnabled) {
            // 2FA enabled but have yet to receive token, send back totp request
            if (!totpToken) return new ApiSuccess<LoginPayload>({ totpEnabled }).send(reply);

            // 2FA enabled but no TOTP secret in database, should never happen in theory
            if (!totpSecret) return new ServerError("TOTP setup incomplete").send(reply);

            // Verify TOTP token
            const verifyToken = app.authService.verifyTotpToken(totpSecret, totpToken);
            if (!verifyToken) return new UnauthorizedError("Invalid TOTP token").send(reply);
        }

        // Password and 2FA have been verified, send cookies
        const token = app.authService.generateJwtToken(user);
        const data = { username, displayName };
        return new ApiSuccess<LoginPayload>(data).sendWithCookie(reply, token, app);
    };

    // TODO: Generic
    type GeneralCb = (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
    const logout: GeneralCb = async (_, reply) => {
        const { cookieName } = app.config;
        reply.clearCookie(cookieName);

        return new ApiSuccess({}).send(reply);
    };

    type LeaderboardCb = ZodHandler<{ params: typeof userSchemas.leaderboardParams }>;
    const leaderboard: LeaderboardCb = async ({ params }, _, reply) => {
        // Get number of users requested from params
        const { n } = params;

        // Fetch all users from database, send back error if failed
        const tryGetUsers = await app.userService.findAll();
        if (tryGetUsers.isErr()) return tryGetUsers.error.send(reply);

        // Map each user to public user data
        const publicUsers: PublicUser[] = [];
        for (const user of tryGetUsers.value) {
            const tryMapUser = await app.userService.toPublicUser(user);

            // If any user is failing for whatever reason, stop and send back error
            if (tryMapUser.isErr()) return tryMapUser.error.send(reply);

            publicUsers.push(tryMapUser.value);
        }

        // Sort by rank, then get the first n users
        const data = publicUsers.sort((a, b) => a.rank - b.rank).slice(0, n);
        return new ApiSuccess<LeaderboardPayload>(data).send(reply);
    };

    type InfoCb = ZodHandler<{ params: typeof userSchemas.infoParams }>;
    const info: InfoCb = async ({ params }, _, reply) => {
        const { username } = params;

        // Try to find user with username provided, send back error if failed
        const tryGetUser = await app.userService.findByUsername(username);
        if (tryGetUser.isErr()) return tryGetUser.error.send(reply);

        // Try to map user to public user data, send back error if failed
        const tryMapUser = await app.userService.toPublicUser(tryGetUser.value);
        if (tryMapUser.isErr()) return tryMapUser.error.send(reply);

        const data = tryMapUser.value;
        return new ApiSuccess<GetInfoPayload>(data).send(reply);
    };

    const me: GeneralCb = async (req, reply) => {
        const { username } = req;

        // Try to find user with username provided, send back error if failed
        const tryGetUser = await app.userService.findByUsername(username);
        if (tryGetUser.isErr()) return tryGetUser.error.send(reply);

        // Try to map user to personal user data, send back error if failed
        const tryMapUser = await app.userService.toPersonalUser(tryGetUser.value);
        if (tryMapUser.isErr()) return tryMapUser.error.send(reply);

        const data = tryMapUser.value;
        return new ApiSuccess<GetMePayload>(data).send(reply);
    };

    return { register, login, logout, leaderboard, info, me };
};
