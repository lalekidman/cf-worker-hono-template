ALTER TABLE `files_metadata` ADD `filename` text NOT NULL;--> statement-breakpoint
ALTER TABLE `files_metadata` ADD `filepath` text NOT NULL;--> statement-breakpoint
ALTER TABLE `files_metadata` ADD `filesize` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `files_metadata` DROP COLUMN `name`;--> statement-breakpoint
ALTER TABLE `files_metadata` DROP COLUMN `size`;