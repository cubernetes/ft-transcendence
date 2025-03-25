import bcrypt from "bcrypt";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { User } from "../user/user.types.ts";
import type { JwtPayload } from "./auth.types.ts";
import { ApiError } from "../../utils/errors.ts";

export const createAuthService = (app: FastifyInstance) => {
    const { jwt } = app;
    const saltRounds = 10;

    const hashPassword = (password: string): Promise<string> => bcrypt.hash(password, saltRounds);

    const comparePassword = (password: string, hash: string): Promise<boolean> =>
        bcrypt.compare(password, hash);

    const generateToken = (user: User, exp: string = "1d"): string => {
        const { id, username, displayName } = user;

        const payload: JwtPayload = { id: String(id), username, displayName } satisfies Omit<
            JwtPayload,
            "iat" | "exp"
        >;

        return jwt.sign(payload, { expiresIn: exp });
    };

    const verifyToken = (token: string): JwtPayload => jwt.verify(token) as JwtPayload;

    const jwtAuth = (req: FastifyRequest, reply: FastifyReply) => {
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
        if (!payload || !payload.id || isNaN(Number(payload.id))) {
            const error = new ApiError("UNAUTHORIZED", 401, "Invalid or expired token");
            return error.send(reply);
        }

        req.userId = Number(payload.id);
    };

    return {
        hashPassword,
        comparePassword,
        generateToken,
        verifyToken,
        jwtAuth,
    };
};
