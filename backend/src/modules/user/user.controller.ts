import type { FastifyReply, FastifyRequest } from "fastify";
import type { RegisterBody, LoginBody, TotpBody, LeaderboardParams } from "./user.types.ts";
import { toPersonalUser, toPublicUser } from "./user.helpers.ts";
import { ApiError } from "../../utils/errors.ts";

const registerHandler = async (
    { body }: { body: RegisterBody },
    req: FastifyRequest,
    reply: FastifyReply
): Promise<void> => {
    // Remove confirmPassword from data
    const { confirmPassword, ...userData } = body;

    const passwordHash = await req.server.authService.hashPassword(userData.password);
    const user = await req.server.userService.create({
        ...userData,
        passwordHash,
    });

    if (user.isErr()) {
        return user.error.send(reply);
    }

    const token = req.server.authService.generateToken(user.value);
    return reply.code(201).send({ success: true, data: { token } });
};

const totpSetupHandler = async (
    req: FastifyRequest,
    reply: FastifyReply
): Promise<void> => {
    const user = await req.server.userService.findById(req.userId);

    if (user.isErr()) {
        return user.error.send(reply);
    }

	user.value.totpSecret = 'iorhgoehgoihaeihgioeg';
	req.server.userService.update(user.value.id, user.value);

	const qrCode = user.value.totpSecret + user.value.totpSecret;

    return reply.send({ success: true, data: { qrCode } });
};

const totpVerifyHandler = async (
	{ body }: { body: TotpBody },
    req: FastifyRequest,
    reply: FastifyReply
): Promise<void> => {
    const user = await req.server.userService.findByUsername(body.username);

    if (user.isErr()) {
        return user.error.send(reply);
    }

	const totpToken = body.token;

    if (totpToken !== '123456') {
        const err = new ApiError("UNAUTHORIZED", 401, "Invalid 2FA TOTP token");
        return err.send(reply);
    }

    const jwtToken = req.server.authService.generateToken(user.value);

    return reply.send({ success: true, data: { token: jwtToken } });
};

const loginHandler = async (
    { body }: { body: LoginBody },
    req: FastifyRequest,
    reply: FastifyReply
): Promise<void> => {
    const user = await req.server.userService.findByUsername(body.username);

    if (user.isErr()) {
        return user.error.send(reply);
    }

    const isPasswordValid = await req.server.authService.comparePassword(
        body.password,
        user.value.passwordHash
    );
    if (!isPasswordValid) {
        const err = new ApiError("UNAUTHORIZED", 401, "Invalid password");
        return err.send(reply);
    }

    const token = req.server.authService.generateToken(user.value);
    return reply.send({ success: true, data: { token } });
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

    const publicUsers = users.value.map(toPublicUser);
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
    leaderboard: getLeaderboardHandler,
    me: getMeHandler,
    totpSetup: totpSetupHandler,
    totpVerify: totpVerifyHandler,
};
