import bcrypt from "bcrypt";
import type { FastifyInstance } from "fastify";
import { User } from "../user/user.types.ts";

export const createAuthService = (fastify: FastifyInstance) => {
    const jwt = fastify.jwt;

    const hashPassword = (password: string) => bcrypt.hash(password, 10); // Salt rounds?

    const comparePassword = (password: string, hash: string) => bcrypt.compare(password, hash);

    const generateToken = (user: User, expiration: string = "1d") => {
        const { id, username, displayName } = user;
        return jwt.sign({ id, username, displayName }, { expiresIn: expiration });
    };

    const verifyToken = (token: string) => jwt.verify(token);

    return {
        hashPassword,
        comparePassword,
        generateToken,
        verifyToken,
    };
};
