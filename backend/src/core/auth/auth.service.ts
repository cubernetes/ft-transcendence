import type { FastifyInstance } from "fastify";
import { Result, err, ok } from "neverthrow";
import bcryptjs from "bcryptjs";
import QRCode from "qrcode";
import * as speakeasy from "speakeasy";
import { type JwtPayload, TotpSetupPayload, userSchema } from "@darrenkuro/pong-core";
import { UserRecord } from "../db/db.types.ts";

export const createAuthService = (app: FastifyInstance) => {
    const { jwt } = app;
    const saltRounds = 10;

    const hashPassword = (password: string): Promise<string> => bcryptjs.hash(password, saltRounds);

    const comparePassword = (password: string, hash: string): Promise<boolean> =>
        bcryptjs.compare(password, hash);

    const generateJwtToken = (user: UserRecord, exp: string = "1d"): string => {
        const { id, username, displayName } = user;

        const payload = { id: String(id), username, displayName } satisfies Omit<
            JwtPayload,
            "iat" | "exp"
        >;

        return jwt.sign(payload, { expiresIn: exp });
    };

    const verifyJwtToken = (token: string): Result<JwtPayload, string> => {
        try {
            const payload = jwt.verify(token) as JwtPayload;
            // Runtime type check to ensure token is valid and has the correct fields
            userSchema.jwtPayload.parse(payload);
            return ok(payload);
        } catch (error) {
            return err("invalid JWT token or payload");
        }
    };

    const generateTotpSecret = async (): Promise<TotpSetupPayload> => {
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

    return {
        hashPassword,
        comparePassword,
        generateJwtToken,
        verifyJwtToken,
        generateTotpSecret,
        verifyTotpToken,
    };
};
