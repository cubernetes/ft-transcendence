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
    const { username, displayName, totpEnabled } = user.value;
    const { cookieName, cookieConfig } = req.server.config;

    return reply
        .setCookie(cookieName, token, cookieConfig)
        .code(201)
        .send({ success: true, data: { username, displayName, totpEnabled } });
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

    // Check 2FA
    const { username, displayName, totpEnabled } = user.value;

    if (!totpEnabled) {
        const token = req.server.authService.generateJwtToken(user.value);
        const { cookieName, cookieConfig } = req.server.config;
        reply.setCookie(cookieName, token, cookieConfig);
    }

    return reply.send({ success: true, data: { username, displayName, totpEnabled } });
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
