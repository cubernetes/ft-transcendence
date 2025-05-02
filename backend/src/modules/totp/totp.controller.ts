import type { ErrorCode, TotpBody, TotpUpdateBody } from "@darrenkuro/pong-core";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { Result, err, ok } from "neverthrow";
import { UserRecord } from "../../core/db/db.types";

const verifyTotp = async (
    app: FastifyInstance,
    userId: number,
    token: string,
    useTempSecret: boolean
): Promise<Result<UserRecord, ErrorCode>> => {
    const tryGetUser = await app.userService.findById(userId);
    if (tryGetUser.isErr()) return err(tryGetUser.error);

    const user = tryGetUser.value;
    const secret = useTempSecret ? user.temporaryTotpSecret : user.totpSecret;
    if (!secret) return err("SERVER_ERROR"); // Never

    const verified = app.authService.verifyTotpToken(secret, token);
    if (!verified) return err("INVALID_TOTP_TOKEN");

    return ok(user);
};

const setup = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { server } = req;
    const { secret, qrCode } = await server.authService.generateTotpSecret();

    const tryUpdate = await server.userService.update(req.userId, { temporaryTotpSecret: secret });
    if (tryUpdate.isErr()) return reply.send(tryUpdate.error);

    reply.ok({ qrCode, secret });
};

const verify = async (
    { body }: { body: TotpBody },
    req: FastifyRequest,
    reply: FastifyReply
): Promise<void> => {
    const { server, userId } = req;
    const { token } = body;

    const tryVerify = await verifyTotp(server, userId, token, true);
    if (tryVerify.isErr()) return reply.err(tryVerify.error);

    const user = tryVerify.value;
    const tryUpdate = await server.userService.update(user.id, {
        totpEnabled: 1,
        totpSecret: user.temporaryTotpSecret,
        temporaryTotpSecret: null,
    });
    if (tryUpdate.isErr()) return reply.err(tryUpdate.error);

    reply.send({});
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
    if (tryVerifyOriginal.isErr()) return reply.err(tryVerifyOriginal.error);

    // Verfiy new token
    const tryVerifyNew = await verifyTotp(server, userId, newToken, true);
    if (tryVerifyNew.isErr()) return reply.err(tryVerifyNew.error);

    const user = tryVerifyNew.value;
    // Update to new sercret
    const tryUpdate = await server.userService.update(userId, {
        totpSecret: user.temporaryTotpSecret,
        temporaryTotpSecret: null,
    });
    if (tryUpdate.isErr()) return reply.err(tryUpdate.error);

    reply.ok({});
};

const disable = async (
    { body }: { body: TotpBody },
    req: FastifyRequest,
    reply: FastifyReply
): Promise<void> => {
    const { server, userId } = req;
    const { token } = body;

    const user = await verifyTotp(server, userId, token, false);
    if (user.isErr()) return reply.err(user.error);

    const tryUpdate = await server.userService.update(user.value.id, {
        totpEnabled: 0,
        totpSecret: null,
    });
    if (tryUpdate.isErr()) return reply.err(tryUpdate.error);

    reply.ok({});
};

export default {
    setup,
    verify,
    update,
    disable,
};
