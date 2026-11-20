import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const adminUsers = sqliteTable("admin_users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("SUPER_ADMIN"), // SUPER_ADMIN | CONTENT_EDITOR | HR_RECRUITER | SALES_BD
  avatarInitials: text("avatar_initials").notNull().default("VM"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});
