import type { FastifyReply, FastifyRequest } from "fastify";
import {
    AuthenticationDTO,
    CreateUserDTO,
    LoginUserDTO,
    UserIdDTO,
    UserNameDTO,
} from "./user.types.ts";
import { toPersonalUser, toPublicUser } from "./user.helpers.ts";
import { ApiError } from "../utils/errors.ts";

export const registerHandler = async (
    { body }: { body: CreateUserDTO },
    req: FastifyRequest,
    reply: FastifyReply
) => {
    // Remove confirmPassword from data
    const { confirmPassword, ...userData } = body;

    // Use authService to hash the password
    const hashedPassword = await req.server.authService.hashPassword(userData.password);

    // Create user with hashed password, will throw 409 if user already exists
    const user = await req.server.userService.create({
        ...userData,
        passwordHash: hashedPassword,
    });

    const token = req.server.authService.generateToken(user);

    reply.code(201).send({ success: true, data: { token } });
};

export const loginHandler = async (
    { body }: { body: LoginUserDTO },
    req: FastifyRequest,
    reply: FastifyReply
) => {
    const user = await req.server.userService.findByUsername(body.username);

    if (!user) {
        throw new ApiError("NOT_FOUND", 404, "User not found");
    }

    const isPasswordValid = await req.server.authService.comparePassword(
        body.password,
        user.passwordHash
    );

    if (!isPasswordValid) {
        throw new ApiError("UNAUTHORIZED", 401, "Invalid password");
    }

    const token = req.server.authService.generateToken(user);

    reply.code(200).send({ success: true, data: { token } });
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

export const getMeHandler = async (
    { headers }: { headers: AuthenticationDTO },
    req: FastifyRequest,
    reply: FastifyReply
) => {
    const token = headers.authorization.split(" ")[1]; // Extract the token from the Authorization header (Bearer <token>)
    const decodedPayload = req.server.authService.verifyToken(token) as { id: number };

    const user = await req.server.userService.findById(decodedPayload.id);

    if (!user) {
        throw new ApiError("NOT_FOUND", 404, "User not found");
    }

    reply.send({ success: true, data: toPersonalUser(user) });
};
