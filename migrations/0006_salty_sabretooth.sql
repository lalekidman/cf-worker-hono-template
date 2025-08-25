CREATE INDEX `files_metadata_resource_type_idx` ON `files_metadata` (`resource_type`);--> statement-breakpoint
CREATE INDEX `files_metadata_resource_id_idx` ON `files_metadata` (`resource_id`);--> statement-breakpoint
CREATE INDEX `files_metadata_purpose_idx` ON `files_metadata` (`purpose`);--> statement-breakpoint
CREATE INDEX `files_metadata_resource_type_resource_id_idx` ON `files_metadata` (`resource_type`,`resource_id`);--> statement-breakpoint
CREATE INDEX `files_metadata_resource_type_resource_id_purpose_idx` ON `files_metadata` (`resource_type`,`resource_id`,`purpose`);