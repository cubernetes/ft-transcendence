import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { Result, err, ok } from "neverthrow";
import { TotpBody, TotpUpdateBody } from "@darrenkuro/pong-core";
import { ApiError } from "../../utils/api-response";
import { User } from "../user/user.types";

const verifyTotp = async (
    app: FastifyInstance,
    userId: number,
    token: string,
    useTempSecret: boolean
): Promise<Result<User, ApiError>> => {
    const user = await app.userService.findById(userId);
    if (user.isErr()) {
        return err(user.error);
    }

    const secret = useTempSecret ? user.value.temporaryTotpSecret : user.value.totpSecret;
    if (!secret) {
        return err(new ApiError("BAD_REQUEST", 400, "User does not have TOTP enabled"));
    }

    const verified = app.authService.verifyTotpToken(secret, token);
    if (!verified) {
        return err(new ApiError("UNAUTHORIZED", 401, "Invalid TOTP token"));
    }

    return ok(user.value);
};

const setup = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { server } = req;
    const { secret, qrCode } = await server.authService.generateTotpSecret();

    const tryUpdate = await server.userService.update(req.userId, { temporaryTotpSecret: secret });
    if (tryUpdate.isErr()) {
        return tryUpdate.error.send(reply);
    }

    return reply.send({ success: true, data: { qrCode, secret } });
};

const verify = async (
    { body }: { body: TotpBody },
    req: FastifyRequest,
    reply: FastifyReply
): Promise<void> => {
    const { server, userId } = req;
    const { token } = body;

    const tryVerify = await verifyTotp(server, userId, token, true);
    if (tryVerify.isErr()) {
        return tryVerify.error.send(reply);
    }

    const user = tryVerify.value;
    const tryUpdate = await server.userService.update(user.id, {
        totpEnabled: 1,
        totpSecret: user.temporaryTotpSecret,
        temporaryTotpSecret: null,
    });
    if (tryUpdate.isErr()) {
        return tryUpdate.error.send(reply);
    }

    return reply.send({ success: true, data: {} });
};

const update = async (
    { body }: { body: TotpUpdateBody },
    req: FastifyRequest,
    reply: FastifyReply
): Promise<void> => {
    const { server, userId } = req;
    const { token, newToken } = body;

    // Verify original token
    const tryVerifyOriginal = await verifyTotp(server, userId, token, false);
    if (tryVerifyOriginal.isErr()) {
        return tryVerifyOriginal.error.send(reply);
    }

    // Verfiy new token
    const tryVerifyNew = await verifyTotp(server, userId, newToken, true);
    if (tryVerifyNew.isErr()) {
        return tryVerifyNew.error.send(reply);
    }

    const user = tryVerifyNew.value;
    // Update to new sercret
    const tryUpdate = await server.userService.update(userId, {
        totpSecret: user.temporaryTotpSecret,
        temporaryTotpSecret: null,
    });
    if (tryUpdate.isErr()) {
        return tryUpdate.error.send(reply);
    }

    return reply.send({ success: true, data: {} });
};

const disable = async (
    { body }: { body: TotpBody },
    req: FastifyRequest,
    reply: FastifyReply
): Promise<void> => {
    const { server, userId } = req;
    const { token } = body;

    const user = await verifyTotp(server, userId, token, false);
    if (user.isErr()) {
        return user.error.send(reply);
    }

    const tryUpdate = await server.userService.update(user.value.id, {
        totpEnabled: 0,
        totpSecret: null,
    });
    if (tryUpdate.isErr()) {
        return tryUpdate.error.send(reply);
    }

    return reply.send({ success: true, data: {} });
};

export default {
    setup,
    verify,
    update,
    disable,
};
