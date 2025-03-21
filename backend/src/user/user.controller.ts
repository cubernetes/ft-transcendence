import type { FastifyReply, FastifyRequest } from "fastify";
import { CreateUserDTO, UserIdDTO, UserNameDTO } from "./user.types.ts";
import { toPublicUser } from "./user.helpers.ts";
import { ApiError } from "../utils/errors.ts";

export const createUserHandler = async (
    { body }: { body: CreateUserDTO },
    req: FastifyRequest,
    reply: FastifyReply
) => {
    // Remove confirmPassword from data
    const { confirmPassword, ...userData } = body;

    // Use authService to hash the password
    const hashedPassword = await req.server.authService.hashPassword(userData.password);

    // Create user with hashed password
    const user = await req.server.userService.create({
        ...userData,
        passwordHash: hashedPassword,
    });

    reply.code(201).send(toPublicUser(user));
};

export const getUserByIdHandler = async (
    { params }: { params: UserIdDTO },
    req: FastifyRequest,
    reply: FastifyReply
) => {
    const user = await req.server.userService.findById(params.id);

    if (!user) {
        throw new ApiError("NOT_FOUND", 404, "User not found");
    }

    reply.send(toPublicUser(user));
};

export const getUserByUsernameHandler = async (
    { params }: { params: UserNameDTO },
    req: FastifyRequest,
    reply: FastifyReply
) => {
    const user = await req.server.userService.findByUsername(params.username);

    if (!user) {
        throw new ApiError("NOT_FOUND", 404, "User not found");
    }

    reply.send(toPublicUser(user));
};

export const getAllUsersHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    const users = await req.server.userService.findAll();
    const publicUsers = users.map((user) => toPublicUser(user));

    reply.send(publicUsers);
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
