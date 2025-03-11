import { sqliteTable, check, integer, text, numeric, primaryKey } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
    id: integer().primaryKey({ autoIncrement: true }),
    username: text().unique().notNull(),
    displayName: text("display_name").notNull(),
    passwordHash: text("password_hash").notNull(),
    totpSecret: text("totp_secret"),
    avatarUrl: text("avatar_url").default("/assets/default-avatar.png"),
    wins: integer().default(0),
    losses: integer().default(0),
    createdAt: numeric("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const games = sqliteTable(
    "games",
    {
        id: integer().primaryKey({ autoIncrement: true }),
        tournamentId: integer("tournament_id").references(() => tournaments.id),
        player1Id: integer("player1_id")
            .notNull()
            .references(() => users.id),
        player2Id: integer("player2_id")
            .notNull()
            .references(() => users.id),
        winnerId: integer("winner_id").references(() => users.id),
        player1Score: integer("player1_score").notNull(),
        player2Score: integer("player2_score").notNull(),
        createdAt: numeric("created_at").default(sql`(CURRENT_TIMESTAMP)`),
        finishedAt: numeric("finished_at"),
    },
    () => [
        check(
            "games_check_1",
            sql`winner_id IS NULL OR (winner_id = player1_id OR winner_id = player2_id)`
        ),
        check("games_check_2", sql`player1_id != player2_id`),
        check("games_check_3", sql`player1_score >= 0 AND player2_score >= 0`),
        check(
            "game_check_4",
            sql`(winner_id IS NULL AND finished_at IS NULL) OR (winner_id IS NOT NULL AND finished_at IS NOT NULL)`
        ),
    ]
);

export const tournaments = sqliteTable(
    "tournaments",
    {
        id: integer().primaryKey({ autoIncrement: true }),
        name: text().notNull(),
        creatorId: integer("creator_id")
            .notNull()
            .references(() => users.id),
        winnerId: integer("winner_id").references(() => users.id),
        createdAt: numeric("created_at").default(sql`(CURRENT_TIMESTAMP)`),
        finishedAt: numeric("finished_at"),
    },
    () => [
        check(
            "tournaments_check_1",
            sql`(winner_id IS NULL AND finished_at IS NULL) OR (winner_id IS NOT NULL AND finished_at IS NOT NULL)`
        ),
    ]
);

export const friends = sqliteTable(
    "friends",
    {
        user1Id: integer("user1_id")
            .notNull()
            .references(() => users.id),
        user2Id: integer("user2_id")
            .notNull()
            .references(() => users.id),
        status: text().default("pending"),
        createdAt: numeric("created_at").default(sql`(CURRENT_TIMESTAMP)`),
    },
    (table) => [
        primaryKey({
            columns: [table.user1Id, table.user2Id],
            name: "friends_user1_id_user2_id_pk",
        }),
        check("friends_check_1", sql`user1_id != user2_id AND user1_id < user2_id`),
        check("friends_check_2", sql`status in ('pending', 'accepted')`),
    ]
);
