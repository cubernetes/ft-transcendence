CREATE TABLE `friends` (
	`user1_id` integer NOT NULL,
	`user2_id` integer NOT NULL,
	`status` text DEFAULT 'pending',
	`created_at` numeric DEFAULT (CURRENT_TIMESTAMP),
	PRIMARY KEY(`user1_id`, `user2_id`),
	FOREIGN KEY (`user1_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user2_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "friends_check_1" CHECK(user1_id != user2_id AND user1_id < user2_id),
	CONSTRAINT "friends_check_2" CHECK(status in ('pending', 'accepted'))
);
--> statement-breakpoint
CREATE TABLE `games` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tournament_id` integer,
	`player1_id` integer NOT NULL,
	`player2_id` integer NOT NULL,
	`winner_id` integer,
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
CREATE TABLE `tournaments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`creator_id` integer NOT NULL,
	`winner_id` integer,
	`created_at` numeric DEFAULT (CURRENT_TIMESTAMP),
	`finished_at` numeric,
	FOREIGN KEY (`creator_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`winner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "tournaments_check_1" CHECK((winner_id IS NULL AND finished_at IS NULL) OR (winner_id IS NOT NULL AND finished_at IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`display_name` text NOT NULL,
	`password_hash` text NOT NULL,
	`totp_secret` text,
	`totp_enabled` integer DEFAULT 0,
	`avatar_url` text DEFAULT '/assets/default-avatar.png',
	`wins` integer DEFAULT 0,
	`losses` integer DEFAULT 0,
	`created_at` numeric DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);
