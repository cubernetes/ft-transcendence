// import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
// import { eq } from "drizzle-orm";
// import { tournaments } from "../plugins/db/schema";

// export default class TournamentService {
//     constructor(private readonly db: BetterSQLite3Database) {}

//     async findAll() {
//         try {
//             return await this.db.select().from(tournaments);
//         } catch (error) {
//             console.error(`Error fetching all tournaments:`, error);
//             throw new Error(`Failed to fetch tournaments`);
//         }
//     }

//     async findById(id: number) {
//         try {
//             const tournament = await this.db
//                 .select()
//                 .from(tournaments)
//                 .where(eq(tournaments.id, id));
//             if (!tournament || tournament.length === 0) {
//                 throw new Error(`Tournament not found`);
//             }
//             return tournament[0];
//         } catch (error) {
//             console.error(`Error fetching tournament ${id}:`, error);
//             throw error;
//         }
//     }

//     async create() {}

//     async update(id: number) {
//         id;
//     }

//     async delete(id: number) {
//         id;
//     }
// }
