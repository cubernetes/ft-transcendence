// import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
// import { eq, or, and } from "drizzle-orm";
// import { friends } from "../plugins/db/schema";
// import { CustomError } from "../utils/errors";

// export default class FriendService {
//     constructor(private readonly db: BetterSQLite3Database) {}

//     // Get all friendships composite keys by user id
//     // TODO: think about this more!!
//     async findAllFriendshipsById(id: number) {
//         try {
//             return await this.db
//                 .select()
//                 .from(friends)
//                 .where(
//                     and(
//                         or(eq(friends.user1Id, id), eq(friends.user2Id, id)),
//                         eq(friends.status, `accepted`)
//                     )
//                 );
//         } catch (error) {
//             //console.error("Error fetching all games:", error);
//             throw new CustomError(`Failed to fetch friendships`);
//         }
//     }
//     async postFriendRequest() {}
//     async acceptFriendRequest() {}
// }
