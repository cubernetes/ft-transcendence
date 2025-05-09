// Pulled with drizzle-kit, maybe automatically generate it during build so no need to mannually update it?
import { relations } from "drizzle-orm/relations";
import { friends, games, users } from "./db.schema.ts";

export const gamesRelations = relations(games, ({ one }) => ({
    user_winnerId: one(users, {
        fields: [games.winnerId],
        references: [users.id],
        relationName: "games_winnerId_users_id",
    }),
    user_player2Id: one(users, {
        fields: [games.player2Id],
        references: [users.id],
        relationName: "games_player2Id_users_id",
    }),
    user_player1Id: one(users, {
        fields: [games.player1Id],
        references: [users.id],
        relationName: "games_player1Id_users_id",
    }),
}));

export const usersRelations = relations(users, ({ many }) => ({
    games_winnerId: many(games, {
        relationName: "games_winnerId_users_id",
    }),
    games_player2Id: many(games, {
        relationName: "games_player2Id_users_id",
    }),
    games_player1Id: many(games, {
        relationName: "games_player1Id_users_id",
    }),
    friends_user2Id: many(friends, {
        relationName: "friends_user2Id_users_id",
    }),
    friends_user1Id: many(friends, {
        relationName: "friends_user1Id_users_id",
    }),
}));

export const friendsRelations = relations(friends, ({ one }) => ({
    user_user2Id: one(users, {
        fields: [friends.user2Id],
        references: [users.id],
        relationName: "friends_user2Id_users_id",
    }),
    user_user1Id: one(users, {
        fields: [friends.user1Id],
        references: [users.id],
        relationName: "friends_user1Id_users_id",
    }),
}));
