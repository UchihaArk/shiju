PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_events` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`note` text,
	`date` text NOT NULL,
	`recurrence` text NOT NULL,
	`created_by` text NOT NULL,
	`color` text NOT NULL,
	`subject_id` text,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_events`("id", "title", "note", "date", "recurrence", "created_by", "color", "subject_id") SELECT "id", "title", "note", "date", "recurrence", "created_by", "color", "subject_id" FROM `events`;--> statement-breakpoint
DROP TABLE `events`;--> statement-breakpoint
ALTER TABLE `__new_events` RENAME TO `events`;--> statement-breakpoint
PRAGMA foreign_keys=ON;