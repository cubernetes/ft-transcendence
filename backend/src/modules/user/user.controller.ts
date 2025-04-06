import type { FastifyReply, FastifyRequest } from "fastify";
import type { RegisterBody, LoginBody, TotpBody, TotpBodyInitial, LeaderboardParams } from "./user.types.ts";
import { toPersonalUser, toPublicUser } from "./user.helpers.ts";
import QRCode from "qrcode";
import * as speakeasy from "speakeasy";
import { ApiError } from "../../utils/errors.ts";

const registerHandler = async (
    { body }: { body: RegisterBody },
    req: FastifyRequest,
    reply: FastifyReply
): Promise<void> => {
    // Remove confirmPassword from data
    const { confirmPassword, ...userData } = body;

    const passwordHash = await req.server.authService.hashPassword(userData.password);

    const userWithHash = {
        ...userData,
        passwordHash,
    };

    const user = await req.server.userService.create(userWithHash);

    if (user.isErr()) {
        return user.error.send(reply);
    }

    const token = req.server.authService.generateToken(user.value);
    const totpEnabled = user.value.totpEnabled;

    return reply.code(201).send({ success: true, data: { token, totpEnabled } });
};

const totpSetupHandler = async (
    req: FastifyRequest,
    reply: FastifyReply
): Promise<void> => {
    const user = await req.server.userService.findById(req.userId);

    if (user.isErr()) {
        return user.error.send(reply);
    }

    const secret = speakeasy.generateSecret();
	const b32secret = secret.base32
	user.value.temporaryTotpSecret = b32secret;
    req.server.userService.update(user.value.id, user.value);

    if (!secret?.otpauth_url) {
        const err = new ApiError("INTERNAL_SERVER_ERROR", 500, "Could not generate OTP auth URL");
        return err.send(reply);
    }

    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    return reply.send({ success: true, data: { qrCode, b32secret } });
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
    const totpSecret = user.value.totpSecret;

    if (!totpSecret) {
        const err = new ApiError("BAD_REQUEST", 400, "User does not have TOTP enabled");
        return err.send(reply);
    }

    const verified = speakeasy.totp.verify({
        secret: totpSecret,
        encoding: "base32",
        token: totpToken,
    });

    if (!verified) {
        const err = new ApiError("UNAUTHORIZED", 401, "Invalid TOTP token");
        return err.send(reply);
    }

    const jwtToken = req.server.authService.generateToken(user.value);

    return reply.send({ success: true, data: { token: jwtToken } });
};

const totpVerifyInitialHandler = async (
    { body }: { body: TotpBodyInitial },
    req: FastifyRequest,
    reply: FastifyReply
): Promise<void> => {
    const user = await req.server.userService.findById(req.userId);

    if (user.isErr()) {
        return user.error.send(reply);
    }

    const totpToken = body.token;
    const totpSecret = user.value.temporaryTotpSecret;

    if (!totpSecret) {
        const err = new ApiError("BAD_REQUEST", 400, "User does not have TOTP enabled");
        return err.send(reply);
    }

    const verified = speakeasy.totp.verify({
        secret: totpSecret,
        encoding: "base32",
        token: totpToken,
    });

    if (!verified) {
        const err = new ApiError("UNAUTHORIZED", 401, "Invalid TOTP token");
        return err.send(reply);
    }

    user.value.totpEnabled = 1;
	user.value.totpSecret = user.value.temporaryTotpSecret;
    req.server.userService.update(user.value.id, user.value);

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

    const totpEnabled = user.value.totpEnabled;

    let token;
    if (totpEnabled) {
        token = "totp-needed";
    } else {
        token = req.server.authService.generateToken(user.value);
    }

    return reply.send({ success: true, data: { token, totpEnabled } });
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
    totpVerifyInitial: totpVerifyInitialHandler,
};
