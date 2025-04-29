PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_games` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tournament_id` integer,
	`player1_id` integer NOT NULL,
	`player2_id` integer NOT NULL,
	`winner_id` integer NOT NULL,
	`player1_score` integer NOT NULL,
	`player2_score` integer NOT NULL,
	`created_at` numeric DEFAULT (CURRENT_TIMESTAMP),
	`finished_at` numeric,
	FOREIGN KEY (`tournament_id`) REFERENCES `tournaments`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`player1_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`player2_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`winner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "games_check_1" CHECK(winner_id IS NULL OR (winner_id = player1_id OR winner_id = player2_id)),
	CONSTRAINT "games_check_2" CHECK(player1_id != player2_id),
	CONSTRAINT "games_check_3" CHECK(player1_score >= 0 AND player2_score >= 0),
	CONSTRAINT "game_check_4" CHECK((winner_id IS NULL AND finished_at IS NULL) OR (winner_id IS NOT NULL AND finished_at IS NOT NULL))
);
--> statement-breakpoint
INSERT INTO `__new_games`("id", "tournament_id", "player1_id", "player2_id", "winner_id", "player1_score", "player2_score", "created_at", "finished_at") SELECT "id", "tournament_id", "player1_id", "player2_id", "winner_id", "player1_score", "player2_score", "created_at", "finished_at" FROM `games`;--> statement-breakpoint
DROP TABLE `games`;--> statement-breakpoint
ALTER TABLE `__new_games` RENAME TO `games`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`display_name` text NOT NULL,
	`password_hash` text NOT NULL,
	`totp_secret` text,
	`temporary_totp_secret` text,
	`totp_enabled` integer DEFAULT 0 NOT NULL,
	`avatar_url` text DEFAULT '/assets/default-avatar.png' NOT NULL,
	`wins` integer DEFAULT 0 NOT NULL,
	`losses` integer DEFAULT 0 NOT NULL,
	`created_at` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "username", "display_name", "password_hash", "totp_secret", "temporary_totp_secret", "totp_enabled", "avatar_url", "wins", "losses", "created_at") SELECT "id", "username", "display_name", "password_hash", "totp_secret", "temporary_totp_secret", "totp_enabled", "avatar_url", "wins", "losses", "created_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);