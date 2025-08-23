ALTER TABLE `files_metadata` ADD `bucket_name` text NOT NULL;--> statement-breakpoint
ALTER TABLE `files_metadata` ADD `expires_in` integer;--> statement-breakpoint
ALTER TABLE `files_metadata` ADD `status` text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `files_metadata` DROP COLUMN `uploaded`;