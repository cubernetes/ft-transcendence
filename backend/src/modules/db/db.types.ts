import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { friends, games, tournaments, users } from "./db.schema";

export type Game = InferSelectModel<typeof games>;
export type GameInsert = InferInsertModel<typeof games>;

export type Tournament = InferSelectModel<typeof tournaments>;
export type TournamentInsert = InferInsertModel<typeof tournaments>;

export type Friendship = InferSelectModel<typeof friends>;
export type FriendshipInsert = InferInsertModel<typeof friends>;
