import type { User } from "../../modules/user/user.types.ts";
import type { JwtPayload } from "@darrenkuro/pong-core";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { Result, err, ok } from "neverthrow";
import bcrypt from "bcrypt";
import QRCode from "qrcode";
import * as speakeasy from "speakeasy";
import { userSchemas } from "@darrenkuro/pong-core";
import { ApiError } from "../../utils/errors.ts";

export const verifyCookie = async (req: FastifyRequest, _: FastifyReply) => {
    const { cookieName } = req.server.config;
    const token = req.cookies?.[cookieName];
    if (!token) return;

    const payload = req.server.authService.verifyJwtToken(token);
    if (payload.isOk() && payload.value.id && !isNaN(Number(payload.value.id))) {
        req.userId = Number(payload.value.id);
    }
};

export const createAuthService = (app: FastifyInstance) => {
    const { jwt } = app;
    const saltRounds = 10;

    const hashPassword = (password: string): Promise<string> => bcrypt.hash(password, saltRounds);

    const comparePassword = (password: string, hash: string): Promise<boolean> =>
        bcrypt.compare(password, hash);

    // TODO: exp to be defined in jwt plugin; also, maybe use access/refresh token?
    const generateJwtToken = (user: User, exp: string = "1d"): string => {
        const { id, username, displayName } = user;

        const payload = { id: String(id), username, displayName } satisfies Omit<
            JwtPayload,
            "iat" | "exp"
        >;

        return jwt.sign(payload, { expiresIn: exp });
    };

    const verifyJwtToken = (token: string): Result<JwtPayload, Error> => {
        try {
            const payload = jwt.verify(token) as JwtPayload;
            userSchemas.jwtPayload.parse(payload); // Runtime type check to ensure token is valid
            return ok(payload);
        } catch (error) {
            return err(new Error("Invalid JWT token or payload"));
        }
    };

    const generateTotpSecret = async (): Promise<{ qrCode: string; secret: string }> => {
        const generatedSecret = speakeasy.generateSecret({ otpauth_url: true });

        const encoding = app.config.totpEncoding;
        const secret = generatedSecret[encoding];
        const qrCode = await QRCode.toDataURL(generatedSecret.otpauth_url);
        return { secret, qrCode };
    };

    const verifyTotpToken = (secret: string, token: string): boolean => {
        const encoding = app.config.totpEncoding;
        return speakeasy.totp.verify({ secret, token, encoding });
    };

    const requireAuth = async (req: FastifyRequest, reply: FastifyReply) => {
        // Check that userId exists and is larger than 0 (Attached by onRequest hook)
        if (!req.userId || req.userId <= 0) {
            const error = new ApiError("UNAUTHORIZED", 401, "Authentication required");
            return error.send(reply);
        }
    };

    return {
        hashPassword,
        comparePassword,
        generateJwtToken,
        verifyJwtToken,
        generateTotpSecret,
        verifyTotpToken,
        requireAuth,
    };
};
