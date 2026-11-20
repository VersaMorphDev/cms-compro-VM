import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const teamMembers = sqliteTable("team_members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  role: text("role").notNull(),
  bio: text("bio").notNull(),
  image: text("image").notNull(),
  linkedinUrl: text("linkedin_url"),
  twitterUrl: text("twitter_url"),
  status: text("status").notNull().default("PUBLISHED"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const testimonials = sqliteTable("testimonials", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  quote: text("quote").notNull(),
  author: text("author").notNull(),
  role: text("role").notNull(),
  company: text("company").notNull(),
  project: text("project").notNull(),
  status: text("status").notNull().default("PUBLISHED"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const jobOpenings = sqliteTable("job_openings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  department: text("department").notNull(),
  location: text("location").notNull(),
  type: text("type").notNull(), // Full-time | Part-time | Contract | Internship | Project Based | Freelance
  workEcosystem: text("work_ecosystem").notNull(), // On-site | Hybrid | Remote
  category: text("category").notNull(), // Technology | Non-IT
  description: text("description").notNull(),
  requirements: text("requirements", { mode: "json" })
    .$type<string[]>()
    .notNull()
    .default([]),
  status: text("status").notNull().default("OPEN"), // OPEN | CLOSED | DRAFT
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const siteSettings = sqliteTable("site_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  value: text("value", { mode: "json" })
    .$type<Record<string, unknown>>()
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export interface LegalTocSection {
  id: string;
  label: string;
}

export const legalPages = sqliteTable("legal_pages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull().default(""),
  lastUpdated: text("last_updated").notNull().default("June 2026"),
  tocSections: text("toc_sections", { mode: "json" })
    .$type<LegalTocSection[]>()
    .notNull()
    .default([]),
  content: text("content").notNull(),
  version: text("version").notNull().default("1.0"),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});
