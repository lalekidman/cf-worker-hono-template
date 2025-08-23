PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_files_metadata` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`_v` integer DEFAULT 1 NOT NULL,
	`filename` text NOT NULL,
	`filepath` text NOT NULL,
	`filesize` integer NOT NULL,
	`content_type` text NOT NULL,
	`uploaded` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_files_metadata`("id", "created_at", "updated_at", "_v", "filename", "filepath", "filesize", "content_type", "uploaded") SELECT "id", "created_at", "updated_at", "_v", "filename", "filepath", "filesize", "content_type", "uploaded" FROM `files_metadata`;--> statement-breakpoint
DROP TABLE `files_metadata`;--> statement-breakpoint
ALTER TABLE `__new_files_metadata` RENAME TO `files_metadata`;--> statement-breakpoint
PRAGMA foreign_keys=ON;