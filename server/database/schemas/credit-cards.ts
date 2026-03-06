import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { users } from "./auth";

/**
 * Credit Cards table
 */
export const creditCards = sqliteTable("credit_cards", (t) => ({
  id: t.text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: t.text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: t.text("name").notNull(),
  lastFourDigits: t.text("last_four_digits"),
  brand: t.text("brand", { enum: ["visa", "mastercard", "elo", "amex", "other"] }).notNull().default("other"),
  creditLimit: t.real("credit_limit").notNull().default(0),
  closingDay: t.integer("closing_day").notNull(),
  dueDay: t.integer("due_day").notNull(),
  color: t.text("color"),
  isActive: t.integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: t.integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  updatedAt: t.integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
}));

/**
 * Credit Card Invoices table
 */
export const creditCardInvoices = sqliteTable("credit_card_invoices", (t) => ({
  id: t.text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  creditCardId: t.text("credit_card_id").notNull().references(() => creditCards.id, { onDelete: "cascade" }),
  userId: t.text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  referenceMonth: t.text("reference_month").notNull(), // Format YYYY-MM
  totalAmount: t.real("total_amount").notNull().default(0),
  status: t.text("status", { enum: ["open", "closed", "paid"] }).notNull().default("open"),
  closingDate: t.text("closing_date"), // Actual closing date
  dueDate: t.text("due_date"), // Actual due date
  createdAt: t.integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  updatedAt: t.integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
}));
