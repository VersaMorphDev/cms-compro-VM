import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const leads = sqliteTable("leads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  website: text("website"),
  service: text("service"),
  source: text("source").notNull().default("contact"), // contact | service-page | partners-apply | chat | meeting | blog-footer
  partnerType: text("partner_type"),
  message: text("message"),
  subscribeNewsletter: integer("subscribe_newsletter", { mode: "boolean" })
    .notNull()
    .default(false),
  metadata: text("metadata", { mode: "json" })
    .$type<Record<string, unknown>>()
    .default({}),
  status: text("status").notNull().default("NEW"), // NEW | CONTACTED | QUALIFIED | PROPOSAL_SENT | WON | LOST
  salesNotes: text("sales_notes"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const affiliates = sqliteTable("affiliates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  affiliateCode: text("affiliate_code").notNull().unique(), // VM-AFF-XXXXXX
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  status: text("status").notNull().default("ACTIVE"), // ACTIVE | SUSPENDED
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const affiliateReferrals = sqliteTable("affiliate_referrals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  affiliateCode: text("affiliate_code").notNull(),
  affiliateName: text("affiliate_name"),
  clientCompany: text("client_company").notNull(),
  clientPicName: text("client_pic_name").notNull(),
  clientPicTitle: text("client_pic_title"),
  clientEmail: text("client_email").notNull(),
  companyIndustry: text("company_industry"),
  companyScale: text("company_scale"),
  platforms: text("platforms"),
  budget: text("budget"),
  timeline: text("timeline"),
  techStack: text("tech_stack"),
  preferredChannel: text("preferred_channel"),
  bestTime: text("best_time"),
  message: text("message"),
  status: text("status").notNull().default("SUBMITTED"), // SUBMITTED | IN_REVIEW | PITCHING | WON | REJECTED
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const jobApplicants = sqliteTable("job_applicants", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  position: text("position").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  linkedin: text("linkedin"),
  portfolioUrl: text("portfolio_url"),
  expectedSalary: text("expected_salary"),
  startDate: text("start_date"),
  workAuth: text("work_auth"),
  resumeFileName: text("resume_file_name"),
  resumeUrl: text("resume_url"),
  message: text("message"),
  status: text("status").notNull().default("APPLIED"), // APPLIED | SCREENING | INTERVIEW | OFFERED | HIRED | REJECTED
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});
