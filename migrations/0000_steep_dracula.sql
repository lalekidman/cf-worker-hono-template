CREATE TABLE `files_metadata` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`_v` integer DEFAULT 1 NOT NULL,
	`uploaded` integer DEFAULT false NOT NULL,
	`name` text NOT NULL,
	`content_type` text NOT NULL,
	`size` integer NOT NULL
);
