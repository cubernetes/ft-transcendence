import type { LeaderboardParams, LoginBody, RegisterBody } from "@darrenkuro/pong-core";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ApiError } from "../../utils/errors.ts";
import { toPersonalUser, toPublicUser } from "./user.helpers.ts";

const registerHandler = async (
    { body }: { body: RegisterBody },
    req: FastifyRequest,
    reply: FastifyReply
): Promise<void> => {
    // Remove confirmPassword from data
    const { confirmPassword, ...userData } = body;

    const passwordHash = await req.server.authService.hashPassword(userData.password);

    const userWithHash = { ...userData, passwordHash };

    const user = await req.server.userService.create(userWithHash);

    if (user.isErr()) {
        return user.error.send(reply);
    }

    const token = req.server.authService.generateJwtToken(user.value);
    const { username, displayName } = user.value;
    const { cookieName, cookieConfig } = req.server.config;

    return reply
        .setCookie(cookieName, token, cookieConfig)
        .code(201)
        .send({ success: true, data: { username, displayName } });
};

const loginHandler = async (
    { body }: { body: LoginBody },
    req: FastifyRequest,
    reply: FastifyReply
): Promise<void> => {
    // Find user
    const user = await req.server.userService.findByUsername(body.username);
    if (user.isErr()) {
        return user.error.send(reply);
    }

    // Validate password
    const isPasswordValid = await req.server.authService.comparePassword(
        body.password,
        user.value.passwordHash
    );
    if (!isPasswordValid) {
        const err = new ApiError("UNAUTHORIZED", 401, "Invalid password");
        return err.send(reply);
    }

    const { username, displayName, totpEnabled, totpSecret } = user.value;

    // Check 2FA
    if (totpEnabled) {
        // 2FA enabled but have yet to receive token
        if (!body.totpToken) {
            return reply.send({ success: true, data: { totpEnabled } });
        }

        // 2FA enabled but no TOTP secret in database (should never happen ideally)
        if (!totpSecret) {
            const err = new ApiError("INTERNAL_SERVER_ERROR", 500, "TOTP setup incomplete");
            return err.send(reply);
        }

        // Verify the TOTP token
        const isTotpValid = req.server.authService.verifyTotpToken(totpSecret, body.totpToken);
        if (!isTotpValid) {
            const err = new ApiError("UNAUTHORIZED", 401, "Invalid TOTP token");
            return err.send(reply);
        }
    }

    // 2FA verified, send cookies
    const token = req.server.authService.generateJwtToken(user.value);
    const { cookieName, cookieConfig } = req.server.config;
    return reply
        .setCookie(cookieName, token, cookieConfig)
        .send({ success: true, data: { username, displayName } });
};

const logoutHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    const { cookieName } = req.server.config;
    reply.clearCookie(cookieName);

    return { success: true, data: {} };
};

const getLeaderboardHandler = async (
    { params }: { params: LeaderboardParams },
    req: FastifyRequest,
    reply: FastifyReply
) => {
    const { n } = params;
    const users = await req.server.userService.findAll();

    if (users.isErr()) {
        return users.error.send(reply);
    }

    const publicUsers = await Promise.all(users.value.map(toPublicUser(req.server)));
    const leadUsers = publicUsers.sort((a, b) => b.wins - a.wins).slice(0, n);

    return reply.send({ success: true, data: leadUsers });
};

const getMeHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    const user = await req.server.userService.findById(req.userId);

    if (user.isErr()) {
        return user.error.send(reply);
    }

    return reply.send({ success: true, data: toPersonalUser(user.value) });
};

export default {
    register: registerHandler,
    login: loginHandler,
    logout: logoutHandler,
    leaderboard: getLeaderboardHandler,
    me: getMeHandler,
};
