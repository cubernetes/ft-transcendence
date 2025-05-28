import type { PublicUser } from "@darrenkuro/pong-core";
import type { FastifyInstance, RouteHandlerMethod } from "fastify";
import { userSchema } from "@darrenkuro/pong-core";
import { createModuleLogger, createPerformanceLogger } from "../../utils/logger.ts";
import { ZodHandler } from "../../utils/zod-validate.ts";

export const createUserController = (app: FastifyInstance) => {
    const logger = createModuleLogger(app.log, "user");

    type RegisterCb = ZodHandler<{ body: typeof userSchema.registerBody }>;
    const register: RegisterCb = async ({ body }, req, reply) => {
        const perfLogger = createPerformanceLogger(app.log, "user_registration");
        const ip = req.ip;

        logger.info(
            {
                event_type: "registration_attempt",
                username: body.username,
                ip,
                tags: ["user_activity", "registration"],
            },
            `User registration attempt for username: ${body.username}`
        );

        // Remove password fields from user data
        const { confirmPassword, password, ...userData } = body;

        perfLogger.mark("password_hashing_start");
        // Generate and add password hash to user data
        const passwordHash = await app.authService.hashPassword(password);
        const userWithHash = { ...userData, passwordHash };

        perfLogger.mark("database_insert_start");
        // Try create user in database, send back error if failed
        const tryCreateUser = await app.userService.create(userWithHash);
        if (tryCreateUser.isErr()) {
            logger.error(
                {
                    event_type: "registration_failed",
                    username: body.username,
                    error_code: tryCreateUser.error,
                    ip,
                    tags: ["user_activity", "registration", "error"],
                },
                `User registration failed for ${body.username}: ${tryCreateUser.error}`
            );

            return reply.err(tryCreateUser.error);
        }

        perfLogger.mark("token_generation_start");
        // Generate JWT token and send back as cookies
        const user = tryCreateUser.value;
        const token = app.authService.generateJwtToken(user);
        const { username, displayName } = user;

        logger.info(
            {
                event_type: "registration_success",
                user_id: user.id,
                username: user.username,
                ip,
                tags: ["user_activity", "registration", "success"],
            },
            `User registration successful for ${user.username}`
        );

        perfLogger.end({ user_id: user.id, username: user.username });
        reply.ok({ username, displayName }, 201, { token });
    };

    type LoginCb = ZodHandler<{ body: typeof userSchema.loginBody }>;
    const login: LoginCb = async ({ body }, req, reply) => {
        const perfLogger = createPerformanceLogger(app.log, "user_login");
        const { username, password, totpToken } = body;
        const ip = req.ip;

        logger.info(
            {
                event_type: "login_attempt",
                username,
                has_totp_token: !!totpToken,
                ip,
                tags: ["user_activity", "authentication", "login"],
            },
            `Login attempt for username: ${username}`
        );

        perfLogger.mark("user_lookup_start");
        // Try to find user with username provided, send back error if failed
        const tryGetUser = await app.userService.findByUsername(username);
        if (tryGetUser.isErr()) {
            logger.warn(
                {
                    event_type: "login_failed",
                    username,
                    error_code: tryGetUser.error,
                    reason: "user_not_found",
                    ip,
                    tags: ["user_activity", "authentication", "login", "error"],
                },
                `Login failed for ${username}: user not found`
            );

            return reply.err(tryGetUser.error);
        }

        const user = tryGetUser.value;
        const { displayName, totpEnabled, totpSecret, passwordHash } = user;

        perfLogger.mark("password_verification_start");
        // Validate password, send back 401 error if failed
        const verifyPassword = await app.authService.comparePassword(password, passwordHash);
        if (!verifyPassword) {
            logger.warn(
                {
                    event_type: "login_failed",
                    user_id: user.id,
                    username,
                    reason: "invalid_password",
                    ip,
                    tags: ["user_activity", "authentication", "login", "error"],
                },
                `Login failed for ${username}: invalid password`
            );

            perfLogger.end({ user_id: user.id, username, success: false });
            return reply.err("PASSWORD_INVALID");
        }

        // Check 2FA
        if (totpEnabled) {
            // 2FA enabled but have yet to receive token, send back totp request
            if (!totpToken) {
                logger.info(
                    {
                        event_type: "login_2fa_required",
                        user_id: user.id,
                        username,
                        ip,
                        tags: ["user_activity", "authentication", "2fa"],
                    },
                    `2FA token required for ${username}`
                );

                perfLogger.end({ user_id: user.id, username, requires_2fa: true });
                return reply.ok({ totpEnabled });
            }

            // 2FA enabled but no TOTP secret in database, should never happen in theory
            if (!totpSecret) {
                logger.error(
                    {
                        event_type: "login_2fa_error",
                        user_id: user.id,
                        username,
                        reason: "missing_totp_secret",
                        ip,
                        tags: ["user_activity", "authentication", "2fa", "error"],
                    },
                    `2FA error for ${username}: missing TOTP secret`
                );

                perfLogger.end({ user_id: user.id, username, success: false });
                return reply.err("SERVER_ERROR");
            }

            perfLogger.mark("totp_verification_start");
            // Verify TOTP token
            const verifyToken = app.authService.verifyTotpToken(totpSecret, totpToken);
            if (!verifyToken) {
                logger.warn(
                    {
                        event_type: "login_failed",
                        user_id: user.id,
                        username,
                        reason: "invalid_2fa_token",
                        ip,
                        tags: ["user_activity", "authentication", "2fa", "error"],
                    },
                    `Login failed for ${username}: invalid 2FA token`
                );

                perfLogger.end({ user_id: user.id, username, success: false });
                return reply.err("TOKEN_INVALID");
            }
        }

        perfLogger.mark("token_generation_start");
        // Password and 2FA have been verified, send cookies
        const token = app.authService.generateJwtToken(user);

        logger.info(
            {
                event_type: "login_success",
                user_id: user.id,
                username,
                totp_used: totpEnabled,
                ip,
                tags: ["user_activity", "authentication", "login", "success"],
            },
            `Login successful for ${username}`
        );

        perfLogger.end({ user_id: user.id, username, success: true });
        reply.ok({ username, displayName }, 200, { token });
    };

    const logout: RouteHandlerMethod = async (req, reply) => {
        const { cookieName } = app.config;

        logger.info(
            {
                event_type: "logout",
                user_id: req.userId,
                username: req.username,
                ip: req.ip,
                tags: ["user_activity", "authentication", "logout"],
            },
            `User logout: ${req.username}`
        );

        reply.clearCookie(cookieName);
        reply.ok({});
    };

    type DisplayNameCb = ZodHandler<{ body: typeof userSchema.displayNameBody }>;
    const displayname: DisplayNameCb = async ({ body }, req, reply) => {
        const { displayName } = body;
        const { userId } = req;

        logger.info(
            {
                event_type: "profile_update",
                user_id: req.userId,
                username: req.username,
                field: "display_name",
                new_value: displayName,
                tags: ["user_activity", "profile_update"],
            },
            `Display name update for ${req.username}`
        );

        const tryUpdateUser = await app.userService.update(userId, { displayName });
        if (tryUpdateUser.isErr()) {
            logger.error(
                {
                    event_type: "profile_update_failed",
                    user_id: req.userId,
                    username: req.username,
                    field: "display_name",
                    error_code: tryUpdateUser.error,
                    tags: ["user_activity", "profile_update", "error"],
                },
                `Display name update failed for ${req.username}`
            );

            return reply.err(tryUpdateUser.error);
        }

        reply.ok({});
    };

    type PasswordCb = ZodHandler<{ body: typeof userSchema.passwordBody }>;
    const password: PasswordCb = async ({ body }, req, reply) => {
        logger.info(
            {
                event_type: "password_change_attempt",
                user_id: req.userId,
                username: req.username,
                ip: req.ip,
                tags: ["user_activity", "password_change"],
            },
            `Password change attempt for ${req.username}`
        );

        const tryGetUser = await app.userService.findById(req.userId);
        if (tryGetUser.isErr()) return reply.err(tryGetUser.error);

        const { passwordHash } = tryGetUser.value;
        const { oldPassword, newPassword } = body;

        const verifyPassword = await app.authService.comparePassword(oldPassword, passwordHash);
        if (!verifyPassword) return reply.err("PASSWORD_INVALID");

        const newPasswordHash = await app.authService.hashPassword(newPassword);
        const tryUpdateUser = await app.userService.update(req.userId, {
            passwordHash: newPasswordHash,
        });
        if (tryUpdateUser.isErr()) return reply.err(tryUpdateUser.error);

        reply.ok({});
    };

    type LeaderboardCb = ZodHandler<{ params: typeof userSchema.leaderboardParams }>;
    const leaderboard: LeaderboardCb = async ({ params }, _, reply) => {
        // Get number of users requested from params
        const { n } = params;

        // Fetch all users from database, send back error if failed
        const tryGetUsers = await app.userService.findAll();
        if (tryGetUsers.isErr()) return reply.err(tryGetUsers.error);

        // Map each user to public user data
        const publicUsers: PublicUser[] = [];
        for (const user of tryGetUsers.value) {
            const tryMapUser = await app.userService.toPublicUser(user);

            // If any user is failing for whatever reason, stop and send back error
            if (tryMapUser.isErr()) return reply.err(tryMapUser.error);

            publicUsers.push(tryMapUser.value);
        }

        // Sort by rank, then get the first n users
        const data = publicUsers.sort((a, b) => a.rank - b.rank).slice(0, n);
        reply.ok(data);
    };

    type InfoCb = ZodHandler<{ params: typeof userSchema.infoParams }>;
    const info: InfoCb = async ({ params }, _, reply) => {
        const { username } = params;

        // Try to find user with username provided, send back error if failed
        const tryGetUser = await app.userService.findByUsername(username);
        if (tryGetUser.isErr()) return reply.err(tryGetUser.error);

        // Try to map user to public user data, send back error if failed
        const tryMapUser = await app.userService.toPublicUser(tryGetUser.value);
        if (tryMapUser.isErr()) return reply.err(tryMapUser.error);

        reply.ok(tryMapUser.value);
    };

    const me: RouteHandlerMethod = async (req, reply) => {
        const { username } = req;

        // Try to find user with username provided, send back error if failed
        const tryGetUser = await app.userService.findByUsername(username);
        if (tryGetUser.isErr()) return reply.err(tryGetUser.error);

        // Try to map user to personal user data, send back error if failed
        const tryMapUser = await app.userService.toPersonalUser(tryGetUser.value);
        if (tryMapUser.isErr()) return reply.err(tryMapUser.error);

        reply.ok(tryMapUser.value);
    };

    const avatar: RouteHandlerMethod = async (req, reply) => {
        const app = req.server;

        const data = await req.file();
        if (!data) return reply.err("BAD_REQUEST");

        const tryUpload = await app.userService.upload(data, req.username);
        if (tryUpload.isErr()) return reply.err(tryUpload.error);

        const avatarUrl = tryUpload.value;
        await app.userService.update(req.userId, { avatarUrl });

        reply.ok({ avatarUrl });
    };

    return { register, login, logout, displayname, password, leaderboard, info, me, avatar };
};
