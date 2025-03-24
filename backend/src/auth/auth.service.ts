import bcrypt from "bcrypt";
import type { FastifyInstance } from "fastify";
import { User } from "../user/user.types.ts";
import { JwtPayload } from "./auth.types.ts";

export const createAuthService = (fastify: FastifyInstance) => {
    const { jwt } = fastify;
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

    return {
        hashPassword,
        comparePassword,
        generateToken,
        verifyToken,
    };
};
