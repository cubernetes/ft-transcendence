import type { ErrorCode, totpSchema } from "@darrenkuro/pong-core";
import type { FastifyInstance, RouteHandlerMethod } from "fastify";
import { Result, err, ok } from "neverthrow";
import { UserRecord } from "../../core/db/db.types";
import { ZodHandler } from "../../utils/zod-validate";

export const createTotpController = (app: FastifyInstance) => {
    const verifyTotp = async (
        userId: number,
        token: string,
        useTempSecret: boolean
    ): Promise<Result<UserRecord, ErrorCode>> => {
        const tryGetUser = await app.userService.findById(userId);
        if (tryGetUser.isErr()) return err(tryGetUser.error);

        const user = tryGetUser.value;
        const secret = useTempSecret ? user.temporaryTotpSecret : user.totpSecret;
        if (!secret) return err("VALIDATION_ERROR"); // User already has totpsecret saved

        const verified = app.authService.verifyTotpToken(secret, token);
        if (!verified) return err("TOKEN_INVALID");

        return ok(user);
    };

    const setup: RouteHandlerMethod = async (req, reply) => {
        const { secret, qrCode } = await app.authService.generateTotpSecret();

        const tryUpdate = await app.userService.update(req.userId, {
            temporaryTotpSecret: secret,
        });
        if (tryUpdate.isErr()) return reply.err(tryUpdate.error);

        reply.ok({ qrCode, secret });
    };

    type VerifyCb = ZodHandler<{ body: typeof totpSchema.totpBody }>;
    const verify: VerifyCb = async ({ body }, req, reply) => {
        const { userId } = req;
        const { token } = body;

        const tryVerify = await verifyTotp(userId, token, true);
        if (tryVerify.isErr()) return reply.err(tryVerify.error);

        const user = tryVerify.value;
        const tryUpdate = await app.userService.update(userId, {
            totpEnabled: 1,
            totpSecret: user.temporaryTotpSecret,
            temporaryTotpSecret: null,
        });
        if (tryUpdate.isErr()) return reply.err(tryUpdate.error);

        reply.ok({});
    };

    type UpdateCb = ZodHandler<{ body: typeof totpSchema.totpUpdateBody }>;
    const update: UpdateCb = async ({ body }, req, reply): Promise<void> => {
        const { userId } = req;
        const { token, newToken } = body;

        // Verify original token
        const tryVerifyOriginal = await verifyTotp(userId, token, false);
        if (tryVerifyOriginal.isErr()) return reply.err(tryVerifyOriginal.error);

        // Verfiy new token
        const tryVerifyNew = await verifyTotp(userId, newToken, true);
        if (tryVerifyNew.isErr()) return reply.err(tryVerifyNew.error);

        const user = tryVerifyNew.value;
        // Update to new sercret
        const tryUpdate = await app.userService.update(userId, {
            totpSecret: user.temporaryTotpSecret,
            temporaryTotpSecret: null,
        });
        if (tryUpdate.isErr()) return reply.err(tryUpdate.error);

        reply.ok({});
    };

    type DisableCb = ZodHandler<{ body: typeof totpSchema.totpBody }>;
    const disable: DisableCb = async ({ body }, req, reply) => {
        const { userId } = req;
        const { token } = body;

        const tryVerify = await verifyTotp(userId, token, false);
        if (tryVerify.isErr()) return reply.err(tryVerify.error);

        const tryUpdate = await app.userService.update(userId, {
            totpEnabled: 0,
            totpSecret: null,
        });
        if (tryUpdate.isErr()) return reply.err(tryUpdate.error);

        reply.ok({});
    };

    return { setup, verify, update, disable };
};
