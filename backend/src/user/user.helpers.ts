import { User } from "./user.type";

/** Remove sensitive fields from user before sending response to themselves. */
export const toPersonalUser = (user: User): Omit<User, "passwordHash"> => {
    const { passwordHash, ...personalUser } = user;
    return personalUser;
};

/** Remove sensitive fields from user before sending response to public. */
export const toPublicUser = (user: User): Omit<User, "passwordHash" | "totpSecret"> => {
    const { passwordHash, totpSecret, ...publicUser } = user;
    return publicUser;
};
