import type { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticationDTO, CreateUserDTO, LeaderboardDTO, LoginUserDTO } from "./user.types.ts";
import { toPersonalUser } from "./user.helpers.ts";
import { ApiError, ok } from "../../utils/errors.ts";

export const registerHandler = async (
    { body }: { body: CreateUserDTO },
    req: FastifyRequest,
    reply: FastifyReply
): Promise<void> => {
    // Remove confirmPassword from data
    const { confirmPassword, ...userData } = body;

    const hashedPassword = await req.server.authService.hashPassword(userData.password);
    const user = await req.server.userService.create({
        ...userData,
        passwordHash: hashedPassword,
    });

    if (!user.success) {
        return user.error.send(reply);
    }

    const token = req.server.authService.generateToken(user.data);
    return reply.code(201).send({ success: true, data: { token } });
};

export const loginHandler = async (
    { body }: { body: LoginUserDTO },
    req: FastifyRequest,
    reply: FastifyReply
): Promise<void> => {
    const user = await req.server.userService.findByUsername(body.username);
    if (!user.success) {
        return user.error.send(reply);
    }

    const isPasswordValid = await req.server.authService.comparePassword(
        body.password,
        user.data.passwordHash
    );
    if (!isPasswordValid) {
        const err = new ApiError("UNAUTHORIZED", 401, "Invalid password");
        return err.send(reply);
    }

    const token = req.server.authService.generateToken(user.data);
    return reply.code(200).send({ success: true, data: { token } });
};

export const getLeaderboardHandler = async (
    { params }: { params: LeaderboardDTO },
    req: FastifyRequest,
    reply: FastifyReply
) => {
    const { n } = params;
    const users = await req.server.userService.findAll();

    if (!users.success) {
        return users.error.send(reply);
    }

    const leadUsers = users.data.sort((a, b) => b.wins - a.wins).slice(0, n);

    return reply.send(ok(leadUsers));
};

export const getMeHandler = async (
    { headers }: { headers: AuthenticationDTO },
    req: FastifyRequest,
    reply: FastifyReply
) => {
    const token = headers.authorization.split(" ")[1]; // Extract the token from the Authorization header (Bearer <token>)
    const decodedPayload = req.server.authService.verifyToken(token);

    // Type??
    const user = await req.server.userService.findById(Number(decodedPayload.id));

    if (!user.success) {
        return user.error.send(reply);
    }

    return reply.send(ok(toPersonalUser(user.data)));
};
