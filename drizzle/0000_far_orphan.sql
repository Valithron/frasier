CREATE TABLE `frasier_quotes` (
	`id` text PRIMARY KEY NOT NULL,
	`body` text NOT NULL,
	`speakers` text NOT NULL,
	`season` integer NOT NULL,
	`episode` integer NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`favorite` integer DEFAULT false NOT NULL,
	`queued` integer DEFAULT false NOT NULL,
	`posted_at` text,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`revision` integer DEFAULT 1 NOT NULL,
	`device_id` text
);
