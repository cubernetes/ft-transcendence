import { PublicUser, User } from "./user.types.ts";

/** Remove sensitive fields from user before sending response to themselves. */
export const toPersonalUser = (user: User): Omit<User, "passwordHash"> => {
    const { passwordHash, ...personalUser } = user;
    return personalUser;
};

/** Remove sensitive fields from user before sending response to public. */
export const toPublicUser = (user: User): PublicUser => {
    const { passwordHash, totpSecret, ...publicUser } = user;
    return publicUser as PublicUser; // TODI: Fix Type
};
