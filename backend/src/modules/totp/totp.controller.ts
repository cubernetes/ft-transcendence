import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { Result, err, ok } from "neverthrow";
import { TotpBody } from "@darrenkuro/pong-core";
import { ApiError } from "../../utils/errors";
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
    server.userService.update(req.userId, { temporaryTotpSecret: secret });

    return reply.send({ success: true, data: { qrCode, secret } });
};

const verify = async (
    { body }: { body: TotpBody },
    req: FastifyRequest,
    reply: FastifyReply
): Promise<void> => {
    const { server } = req;
    const { token } = body;

    const user = await verifyTotp(server, req.userId, token, true);

    if (user.isErr()) {
        return user.error.send(reply);
    }

    user.value.totpEnabled = 1;
    user.value.totpSecret = user.value.temporaryTotpSecret;
    user.value.temporaryTotpSecret = null;
    await server.userService.update(user.value.id, user.value);

    return reply.send({ success: true, data: null });
};

const update = async (
    { body }: { body: TotpUpdateBody },
    req: FastifyRequest,
    reply: FastifyReply
): Promise<void> => {
    const { server } = req;
    const { token, newToken } = body;

    // Verify original token
    const user = await verifyTotp(server, req.userId, token, false);
    if (user.isErr()) {
        return user.error.send(reply);
    }

    // Verfiy new token
    const newUser = await verifyTotp(server, req.userId, newToken, true);
    if (newUser.isErr()) {
        return newUser.error.send(reply);
    }

    // Update to new sercret
    user.value.totpSecret = user.value.temporaryTotpSecret;
    user.value.temporaryTotpSecret = null;
    await server.userService.update(user.value.id, user.value);

    return reply.send({ success: true, data: null });
};

const disable = async (
    { body }: { body: TotpBody },
    req: FastifyRequest,
    reply: FastifyReply
): Promise<void> => {
    const { server } = req;
    const { token } = body;

    const user = await verifyTotp(server, req.userId, token, false);
    if (user.isErr()) {
        return user.error.send(reply);
    }

    user.value.totpEnabled = 0;
    user.value.totpSecret = null;
    await server.userService.update(user.value.id, user.value);

    return reply.send({ success: true, data: null });
};

export default {
    setup,
    verify,
    update,
    disable,
};
