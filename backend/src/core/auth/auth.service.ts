import type { User } from "../../modules/user/user.types.ts";
import type { JwtPayload } from "@darrenkuro/pong-core";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { Result, err, ok } from "neverthrow";
import bcrypt from "bcrypt";
import { schemas } from "@darrenkuro/pong-core";
import { ApiError } from "../../utils/errors.ts";

export const verifyCookie = (req: FastifyRequest, _: FastifyReply) => {
    const { cookieName } = req.server.config;
    const token = req.cookies?.[cookieName];
    if (!token) return;

    const payload = req.server.authService.verifyToken(token);
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
    const generateToken = (user: User, exp: string = "1d"): string => {
        const { id, username, displayName } = user;

        const payload = { id: String(id), username, displayName } satisfies Omit<
            JwtPayload,
            "iat" | "exp"
        >;

        return jwt.sign(payload, { expiresIn: exp });
    };

    const verifyToken = (token: string): Result<JwtPayload, Error> => {
        try {
            const payload = jwt.verify(token) as JwtPayload;
            schemas.jwtPayload.parse(payload); // Runtime type check to ensure token is valid
            return ok(payload);
        } catch (error) {
            return err(new Error("Invalid JWT token or payload"));
        }
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
        generateToken,
        verifyToken,
        requireAuth,
    };
};
