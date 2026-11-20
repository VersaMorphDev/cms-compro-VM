CREATE TABLE `admin_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'SUPER_ADMIN' NOT NULL,
	`avatar_initials` text DEFAULT 'VM' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_users_email_unique` ON `admin_users` (`email`);--> statement-breakpoint
CREATE TABLE `approach_steps` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`num` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `blog_posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`category` text NOT NULL,
	`author` text NOT NULL,
	`role` text NOT NULL,
	`published_date` text NOT NULL,
	`read_time` text NOT NULL,
	`image` text,
	`content` text NOT NULL,
	`status` text DEFAULT 'PUBLISHED' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `blog_posts_slug_unique` ON `blog_posts` (`slug`);--> statement-breakpoint
CREATE TABLE `faq_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`category` text NOT NULL,
	`status` text DEFAULT 'PUBLISHED' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`client` text NOT NULL,
	`industry` text NOT NULL,
	`year` text NOT NULL,
	`category` text NOT NULL,
	`description` text NOT NULL,
	`problem` text NOT NULL,
	`solution` text NOT NULL,
	`result` text NOT NULL,
	`tech` text DEFAULT '[]' NOT NULL,
	`gradient` text NOT NULL,
	`image` text,
	`timeline` text DEFAULT '[]' NOT NULL,
	`status` text DEFAULT 'PUBLISHED' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `projects_slug_unique` ON `projects` (`slug`);--> statement-breakpoint
CREATE TABLE `services` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`tagline` text NOT NULL,
	`description` text NOT NULL,
	`icon` text NOT NULL,
	`items` text DEFAULT '[]' NOT NULL,
	`benefits` text DEFAULT '[]' NOT NULL,
	`process` text DEFAULT '[]' NOT NULL,
	`technologies` text DEFAULT '[]' NOT NULL,
	`use_cases` text DEFAULT '[]' NOT NULL,
	`gradient` text NOT NULL,
	`status` text DEFAULT 'PUBLISHED' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `services_slug_unique` ON `services` (`slug`);--> statement-breakpoint
CREATE TABLE `solutions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`icon` text NOT NULL,
	`gradient` text NOT NULL,
	`items` text DEFAULT '[]' NOT NULL,
	`status` text DEFAULT 'PUBLISHED' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `why_choose_us` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `calculator_configs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`config_type` text NOT NULL,
	`key` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`cost` integer,
	`weeks` integer,
	`multiplier` text,
	`interest_value` text,
	`is_active` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `calculator_configs_key_unique` ON `calculator_configs` (`key`);--> statement-breakpoint
CREATE TABLE `partners` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`details` text NOT NULL,
	`category` text NOT NULL,
	`url` text,
	`logo` text NOT NULL,
	`color` text NOT NULL,
	`status` text DEFAULT 'PUBLISHED' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `pricing_tiers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`price` text NOT NULL,
	`price_label` text NOT NULL,
	`features` text DEFAULT '[]' NOT NULL,
	`highlighted` integer DEFAULT false NOT NULL,
	`cta` text NOT NULL,
	`cta_href` text DEFAULT '/contact' NOT NULL,
	`status` text DEFAULT 'PUBLISHED' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `job_openings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`department` text NOT NULL,
	`location` text NOT NULL,
	`type` text NOT NULL,
	`work_ecosystem` text NOT NULL,
	`category` text NOT NULL,
	`description` text NOT NULL,
	`requirements` text DEFAULT '[]' NOT NULL,
	`status` text DEFAULT 'OPEN' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `job_openings_slug_unique` ON `job_openings` (`slug`);--> statement-breakpoint
CREATE TABLE `legal_pages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`version` text DEFAULT '1.0' NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `legal_pages_slug_unique` ON `legal_pages` (`slug`);--> statement-breakpoint
CREATE TABLE `site_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `site_settings_key_unique` ON `site_settings` (`key`);--> statement-breakpoint
CREATE TABLE `team_members` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`bio` text NOT NULL,
	`image` text NOT NULL,
	`linkedin_url` text,
	`twitter_url` text,
	`status` text DEFAULT 'PUBLISHED' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`quote` text NOT NULL,
	`author` text NOT NULL,
	`role` text NOT NULL,
	`company` text NOT NULL,
	`project` text NOT NULL,
	`status` text DEFAULT 'PUBLISHED' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `affiliate_referrals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`affiliate_code` text NOT NULL,
	`affiliate_name` text,
	`client_company` text NOT NULL,
	`client_pic_name` text NOT NULL,
	`client_pic_title` text,
	`client_email` text NOT NULL,
	`company_industry` text,
	`company_scale` text,
	`platforms` text,
	`budget` text,
	`timeline` text,
	`tech_stack` text,
	`preferred_channel` text,
	`best_time` text,
	`message` text,
	`status` text DEFAULT 'SUBMITTED' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `affiliates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`affiliate_code` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`company` text,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `affiliates_affiliate_code_unique` ON `affiliates` (`affiliate_code`);--> statement-breakpoint
CREATE TABLE `job_applicants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`position` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`linkedin` text,
	`portfolio_url` text,
	`expected_salary` text,
	`start_date` text,
	`work_auth` text,
	`resume_file_name` text,
	`resume_url` text,
	`message` text,
	`status` text DEFAULT 'APPLIED' NOT NULL,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`company` text,
	`website` text,
	`service` text,
	`source` text DEFAULT 'contact' NOT NULL,
	`partner_type` text,
	`message` text,
	`subscribe_newsletter` integer DEFAULT false NOT NULL,
	`metadata` text DEFAULT '{}',
	`status` text DEFAULT 'NEW' NOT NULL,
	`sales_notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `activity_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`actor_id` text,
	`actor_name` text DEFAULT 'System' NOT NULL,
	`actor_role` text DEFAULT 'SUPER_ADMIN' NOT NULL,
	`action` text NOT NULL,
	`module` text NOT NULL,
	`target_id` text,
	`target_title` text,
	`changes` text DEFAULT '{}',
	`ip_address` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `system_error_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`reference_code` text NOT NULL,
	`source` text NOT NULL,
	`severity` text DEFAULT 'ERROR' NOT NULL,
	`friendly_message` text NOT NULL,
	`technical_message` text NOT NULL,
	`stack_trace` text,
	`request_url` text,
	`payload_snapshot` text DEFAULT '{}',
	`user_agent` text,
	`actor_name` text,
	`is_resolved` integer DEFAULT false NOT NULL,
	`resolved_by` text,
	`resolved_at` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `system_error_logs_reference_code_unique` ON `system_error_logs` (`reference_code`);