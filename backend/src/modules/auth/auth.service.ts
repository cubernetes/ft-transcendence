import bcrypt from "bcrypt";
import type { FastifyInstance } from "fastify";

export const createAuthService = (fastify: FastifyInstance) => {
    const jwt = fastify.jwt;

    const hashPassword = (password: string) => bcrypt.hash(password, 10); // SaltRounds??

    const comparePassword = (password: string, hash: string) => bcrypt.compare(password, hash);

    const generateToken = (id: number, username: string) => jwt.sign({ id, username });

    const verifyToken = (token: string) => jwt.verify(token);

    return {
        hashPassword,
        comparePassword,
        generateToken,
        verifyToken,
    };
};
