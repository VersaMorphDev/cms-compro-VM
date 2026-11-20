import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const pricingTiers = sqliteTable("pricing_tiers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: text("price").notNull(),
  priceLabel: text("price_label").notNull(),
  features: text("features", { mode: "json" })
    .$type<string[]>()
    .notNull()
    .default([]),
  highlighted: integer("highlighted", { mode: "boolean" })
    .notNull()
    .default(false),
  cta: text("cta").notNull(),
  ctaHref: text("cta_href").notNull().default("/contact"),
  status: text("status").notNull().default("PUBLISHED"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const calculatorConfigs = sqliteTable("calculator_configs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  configType: text("config_type").notNull(), // SERVICE | SCALE | ADDON | PLATFORM | COMPLEX_FEATURE | INFRA_TIER | UX_MULTIPLIER | SCOPE_RATE
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  cost: integer("cost"), // IDR amount for SERVICE baseCost or ADDON cost
  weeks: integer("weeks"), // weeks for SERVICE baseWeeks or ADDON weeks
  multiplier: text("multiplier"), // decimal string e.g. "1.35" for SCALE
  interestValue: text("interest_value"), // mapped service category
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const partners = sqliteTable("partners", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  details: text("details").notNull(),
  category: text("category").notNull(),
  url: text("url"),
  logo: text("logo").notNull(),
  color: text("color").notNull(),
  status: text("status").notNull().default("PUBLISHED"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});
