import {
  sqliteTable,
  integer,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const blogPosts = sqliteTable("blog_posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  author: text("author").notNull(),
  role: text("role").notNull(),
  publishedDate: text("published_date").notNull(),
  readTime: text("read_time").notNull(),
  image: text("image"),
  content: text("content").notNull(),
  status: text("status").notNull().default("PUBLISHED"), // DRAFT | PUBLISHED
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export interface ProjectTimelinePhase {
  phase: string;
  title: string;
  desc: string;
}

export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  client: text("client").notNull(),
  industry: text("industry").notNull(),
  year: text("year").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  problem: text("problem").notNull(),
  solution: text("solution").notNull(),
  result: text("result").notNull(),
  tech: text("tech", { mode: "json" }).$type<string[]>().notNull().default([]),
  gradient: text("gradient").notNull(),
  image: text("image"),
  timeline: text("timeline", { mode: "json" })
    .$type<ProjectTimelinePhase[]>()
    .notNull()
    .default([]),
  status: text("status").notNull().default("PUBLISHED"), // DRAFT | PUBLISHED
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export interface ServiceProcessStep {
  step: string;
  desc: string;
}

export interface ServiceUseCase {
  title: string;
  desc: string;
}

export const services = sqliteTable("services", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  tagline: text("tagline").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  items: text("items", { mode: "json" }).$type<string[]>().notNull().default([]),
  benefits: text("benefits", { mode: "json" })
    .$type<string[]>()
    .notNull()
    .default([]),
  process: text("process", { mode: "json" })
    .$type<ServiceProcessStep[]>()
    .notNull()
    .default([]),
  technologies: text("technologies", { mode: "json" })
    .$type<string[]>()
    .notNull()
    .default([]),
  useCases: text("use_cases", { mode: "json" })
    .$type<ServiceUseCase[]>()
    .notNull()
    .default([]),
  gradient: text("gradient").notNull(),
  status: text("status").notNull().default("PUBLISHED"), // DRAFT | PUBLISHED
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const solutions = sqliteTable("solutions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  gradient: text("gradient").notNull(),
  items: text("items", { mode: "json" }).$type<string[]>().notNull().default([]),
  status: text("status").notNull().default("PUBLISHED"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const approachSteps = sqliteTable("approach_steps", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  num: text("num").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const whyChooseUs = sqliteTable("why_choose_us", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const faqItems = sqliteTable("faq_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category").notNull(), // General | Services | Process | Technical | Support
  status: text("status").notNull().default("PUBLISHED"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const pageSections = sqliteTable(
  "page_sections",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    pageSlug: text("page_slug").notNull(),
    sectionKey: text("section_key").notNull(),
    sectionLabel: text("section_label").notNull(),
    badge: text("badge"),
    badgeSubtext: text("badge_subtext"),
    headline: text("headline"),
    highlight: text("highlight"),
    subtitle: text("subtitle"),
    body: text("body"),
    ctaPrimaryLabel: text("cta_primary_label"),
    ctaPrimaryHref: text("cta_primary_href"),
    ctaSecondaryLabel: text("cta_secondary_label"),
    ctaSecondaryHref: text("cta_secondary_href"),
    extraData: text("extra_data", { mode: "json" })
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    defaultSnapshot: text("default_snapshot", { mode: "json" })
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    isVisible: integer("is_visible", { mode: "boolean" }).notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("page_sections_page_section_idx").on(
      table.pageSlug,
      table.sectionKey
    ),
  ]
);
