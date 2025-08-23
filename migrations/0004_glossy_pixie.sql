PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_files_metadata` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`_v` integer DEFAULT 1 NOT NULL,
	`filename` text NOT NULL,
	`filepath` text NOT NULL,
	`filesize` integer NOT NULL,
	`bucket_name` text DEFAULT '' NOT NULL,
	`expires_in` integer,
	`content_type` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_files_metadata`("id", "created_at", "updated_at", "_v", "filename", "filepath", "filesize", "bucket_name", "expires_in", "content_type", "status") SELECT "id", "created_at", "updated_at", "_v", "filename", "filepath", "filesize", "bucket_name", "expires_in", "content_type", "status" FROM `files_metadata`;--> statement-breakpoint
DROP TABLE `files_metadata`;--> statement-breakpoint
ALTER TABLE `__new_files_metadata` RENAME TO `files_metadata`;--> statement-breakpoint
PRAGMA foreign_keys=ON;