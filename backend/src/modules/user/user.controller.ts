import type { FastifyReply, FastifyRequest } from "fastify";
import { CreateUserDTO, UserIdDTO, UserNameDTO } from "./user.type";
import { toPublicUser } from "./user.helpers";

export const createUserHandler = async (
    { body }: { body: CreateUserDTO },
    req: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        // Remove confirmPassword from data
        const { confirmPassword, ...userData } = body;

        // Use authService to hash the password
        const hashedPassword = await req.server.authService.hashPassword(userData.password);

        // Create user with hashed password
        const user = await req.server.userService.create({
            ...userData,
            passwordHash: hashedPassword,
        });

        if (!user) return reply.code(400).send({ error: "Failed to create user" });
        return reply.code(201).send(toPublicUser(user));
    } catch (error) {
        req.log.error({ err: error }, "Failed to create user");
        return reply.code(500).send({ error: "Internal server error" });
    }
};

export const getUserByIdHandler = async (
    { params }: { params: UserIdDTO },
    req: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        const user = await req.server.userService.findById(params.id);
        if (!user) return reply.code(404).send({ error: "User not found" });
        return reply.send(toPublicUser(user));
    } catch (error) {
        req.log.error({ err: error }, "Failed to get user by ID");
        return reply.code(500).send({ error: "Internal server error" });
    }
};

export const getUserByUsernameHandler = async (
    { params }: { params: UserNameDTO },
    req: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        const user = await req.server.userService.findByUsername(params.username);
        if (!user) return reply.code(404).send({ error: "User not found" });
        return reply.send(toPublicUser(user));
    } catch (error) {
        req.log.error({ err: error }, "Failed to get user by username");
        return reply.code(500).send({ error: "Internal server error" });
    }
};

export const getAllUsersHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const users = await req.server.userService.findAll();
        return reply.send(users);
    } catch (error) {
        req.log.error({ err: error }, "Failed to get all users");
        return reply.code(500).send({ error: "Internal server error" });
    }
};

// export const updateUserHandler = async (
//     request: FastifyRequest<{ Params: { id: string }; Body: UpdateUserDTO }>,
//     reply: FastifyReply
// ) => {
//     const user = await request.server.userService.update(request.params.id, request.body);
//     return reply.send(user);
// };

// export const removeUserHandler = async (
//     request: FastifyRequest<{ Params: { id: string } }>,
//     reply: FastifyReply
// ) => {
//     await request.server.userService.remove(request.params.id);
// };
