import { sql } from "drizzle-orm";
import { check, integer, numeric, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
    id: integer().primaryKey({ autoIncrement: true }),
    username: text().unique().notNull(),
    displayName: text("display_name").notNull(),
    passwordHash: text("password_hash").notNull(),
    totpSecret: text("totp_secret"),
    temporaryTotpSecret: text("temporary_totp_secret"),
    totpEnabled: integer("totp_enabled").notNull().default(0),
    avatarUrl: text("avatar_url").notNull().default("/assets/default-avatar.png"),
    wins: integer().notNull().default(0),
    losses: integer().notNull().default(0),
    createdAt: numeric("created_at")
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
});

export const games = sqliteTable(
    "games",
    {
        id: integer().primaryKey({ autoIncrement: true }),
        player1Id: integer("player1_id")
            .notNull()
            .references(() => users.id),
        player2Id: integer("player2_id")
            .notNull()
            .references(() => users.id),
        winnerId: integer("winner_id")
            .notNull()
            .references(() => users.id),
        player1Hits: integer("player1_hits").notNull(),
        player2Hits: integer("player2_hits").notNull(),
        player1Score: integer("player1_score").notNull(),
        player2Score: integer("player2_score").notNull(),
        createdAt: numeric("created_at").notNull(),
        finishedAt: numeric("finished_at")
            .notNull()
            .default(sql`(CURRENT_TIMESTAMP)`), // Games is written when it ends
    },
    () => [
        check("games_check_1", sql`winner_id = player1_id OR winner_id = player2_id`),
        check("games_check_2", sql`player1_id != player2_id`),
        check("games_check_3", sql`player1_score >= 0 AND player2_score >= 0`),
        check("games_check_4", sql`player1_hits >= 0 AND player2_hits >= 0`),
    ]
);
