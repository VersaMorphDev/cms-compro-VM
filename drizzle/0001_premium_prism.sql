CREATE TABLE `page_sections` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`page_slug` text NOT NULL,
	`section_key` text NOT NULL,
	`section_label` text NOT NULL,
	`badge` text,
	`badge_subtext` text,
	`headline` text,
	`highlight` text,
	`subtitle` text,
	`body` text,
	`cta_primary_label` text,
	`cta_primary_href` text,
	`cta_secondary_label` text,
	`cta_secondary_href` text,
	`extra_data` text DEFAULT '{}' NOT NULL,
	`default_snapshot` text DEFAULT '{}' NOT NULL,
	`is_visible` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `page_sections_page_section_idx` ON `page_sections` (`page_slug`,`section_key`);--> statement-breakpoint
ALTER TABLE `legal_pages` ADD `subtitle` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `legal_pages` ADD `last_updated` text DEFAULT 'June 2026' NOT NULL;--> statement-breakpoint
ALTER TABLE `legal_pages` ADD `toc_sections` text DEFAULT '[]' NOT NULL;