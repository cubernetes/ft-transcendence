import type {
    GetInfoPayload,
    GetMePayload,
    InfoParams,
    LeaderboardParams,
    LeaderboardPayload,
    LoginBody,
    LoginPayload,
    PublicUser,
    RegisterBody,
} from "@darrenkuro/pong-core";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ApiSuccess, ServerError, UnauthorizedError } from "../../utils/api-response.ts";

/** Register handler. */
const register = async (
    { body }: { body: RegisterBody },
    req: FastifyRequest,
    reply: FastifyReply
): Promise<void> => {
    const app = req.server;

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

/** Login handler. */
const login = async (
    { body }: { body: LoginBody },
    req: FastifyRequest,
    reply: FastifyReply
): Promise<void> => {
    const app = req.server;
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

/** Logout handler. */
const logout = async (req: FastifyRequest, reply: FastifyReply) => {
    const { cookieName } = req.server.config;
    reply.clearCookie(cookieName);

    return new ApiSuccess({}).send(reply);
};

/** Get leaderboard handler. */
const getLeaderboard = async (
    { params }: { params: LeaderboardParams },
    req: FastifyRequest,
    reply: FastifyReply
) => {
    const app = req.server;

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

/** Get info handler. */
const getInfo = async (
    { params }: { params: InfoParams },
    req: FastifyRequest,
    reply: FastifyReply
) => {
    const app = req.server;
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

/** Get me handler. */
const getMe = async (req: FastifyRequest, reply: FastifyReply) => {
    const app = req.server;
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

export default { register, login, logout, getLeaderboard, getInfo, getMe };
