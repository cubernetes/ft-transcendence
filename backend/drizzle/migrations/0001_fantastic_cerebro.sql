PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_games` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`player1_id` integer NOT NULL,
	`player2_id` integer NOT NULL,
	`winner_id` integer NOT NULL,
	`player1_hits` integer NOT NULL,
	`player2_hits` integer NOT NULL,
	`player1_score` integer NOT NULL,
	`player2_score` integer NOT NULL,
	`created_at` numeric NOT NULL,
	`finished_at` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`player1_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`player2_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`winner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "games_check_1" CHECK(winner_id = player1_id OR winner_id = player2_id),
	CONSTRAINT "games_check_2" CHECK(player1_id != player2_id),
	CONSTRAINT "games_check_3" CHECK(player1_score >= 0 AND player2_score >= 0),
	CONSTRAINT "games_check_4" CHECK(player1_hits >= 0 AND player2_hits >= 0)
);
--> statement-breakpoint
INSERT INTO `__new_games`("id", "player1_id", "player2_id", "winner_id", "player1_hits", "player2_hits", "player1_score", "player2_score", "created_at", "finished_at") SELECT "id", "player1_id", "player2_id", "winner_id", "player1_hits", "player2_hits", "player1_score", "player2_score", "created_at", "finished_at" FROM `games`;--> statement-breakpoint
DROP TABLE `games`;--> statement-breakpoint
ALTER TABLE `__new_games` RENAME TO `games`;--> statement-breakpoint
PRAGMA foreign_keys=ON;