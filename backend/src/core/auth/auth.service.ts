import type { User } from "../../modules/user/user.types.ts";
import type { JwtPayload } from "@darrenkuro/pong-core";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { Result, err, ok } from "neverthrow";
import bcrypt from "bcrypt";
import { schemas } from "@darrenkuro/pong-core";
import { ApiError } from "../../utils/errors.ts";

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

    const jwtAuth = async (req: FastifyRequest, reply: FastifyReply) => {
        const header = req.headers.authorization;
        if (!header) {
            const error = new ApiError("UNAUTHORIZED", 401, "Missing Authorization header");
            return error.send(reply);
        }
        const [type, token] = header.split(" ");
        if (type !== "Bearer" || !token) {
            const error = new ApiError("UNAUTHORIZED", 401, "Invalid Authorization format");
            return error.send(reply);
        }
        const payload = req.server.authService.verifyToken(token);
        if (payload.isErr() || !payload.value.id || isNaN(Number(payload.value.id))) {
            const error = new ApiError("UNAUTHORIZED", 401, "Invalid or expired token");
            return error.send(reply);
        }

        req.userId = Number(payload.value.id);
    };

    return {
        hashPassword,
        comparePassword,
        generateToken,
        verifyToken,
        jwtAuth,
    };
};
