import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { users } from "./auth";

export const recurringBills = sqliteTable("recurring_bills", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  category: text("category").notNull(),
  amount: real("amount").notNull(),
  dueDay: integer("due_day").notNull(),
  type: text("type", { enum: ["subscription", "fixed_bill"] }).notNull().default("fixed_bill"),
  icon: text("icon"),
  color: text("color"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  startDate: text("start_date"),
  endDate: text("end_date"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});
