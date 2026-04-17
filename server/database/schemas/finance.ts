import { sqliteTable, text, integer, real, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { users } from "./auth";

/**
 * Enums converted to constants for SQLite compatibility
 */
export const transactionTypeEnum = {
  enumValues: ["expense", "income"] as const,
};

export const recurrenceTypeEnum = {
  enumValues: ["single", "monthly_until_december"] as const,
};

/**
 * Categories table
 */
export const categories = sqliteTable("categories", (t) => ({
  id: t.text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: t.text("name").notNull(),
  type: t.text("type").notNull().default("expense"),
  isActive: t.integer("is_active", { mode: "boolean" }).default(true),
  userId: t.text("user_id").references(() => users.id, { onDelete: "cascade" }),
  createdAt: t.integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
}), (table) => ({
  nameTypeUnique: uniqueIndex("categories_name_type_userId_unique").on(table.name, table.type, table.userId),
}));

/**
 * Responsible persons table
 */
export const responsiblePersons = sqliteTable("responsible_persons", (t) => ({
  id: t.text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: t.text("name").notNull(),
  isActive: t.integer("is_active", { mode: "boolean" }).default(true),
  userId: t.text("user_id").references(() => users.id, { onDelete: "cascade" }),
  createdAt: t.integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
}), (table) => [
  uniqueIndex("responsible_persons_name_userId_unique").on(table.name, table.userId),
]);

/**
 * Transactions table
 */
export const transactions = sqliteTable("transactions", (t) => ({
  id: t.text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  type: t.text("type").notNull().default("expense"),
  date: t.integer("date", { mode: "timestamp" }).notNull(),
  amount: t.real("amount").notNull(),
  description: t.text("description").notNull(),
  category: t.text("category").notNull(),
  status: t.text("status"),
  paymentMethod: t.text("payment_method"),
  responsible: t.text("responsible"),
  location: t.text("location"),
  month: t.text("month").notNull(),
  year: t.integer("year").notNull(),
  isRecurrent: t.integer("is_recurrent", { mode: "boolean" }).notNull().default(false),
  recurrenceType: t.text("recurrence_type").default("single"),
  recurrenceGroup: t.text("recurrence_group"),
  creditCardId: t.text("credit_card_id"), // Reference to creditCards.id, left without strict fk for sqlite flexibility if needed, or we can add fk.
  userId: t.text("user_id").references(() => users.id, { onDelete: "cascade" }),
  createdAt: t.integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
}));

/**
 * Category limits table
 */
export const categoryLimits = sqliteTable("category_limits", (t) => ({
  id: t.text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  category: t.text("category").notNull(),
  monthlyLimit: t.real("monthly_limit").default(0),
  annualLimit: t.real("annual_limit").default(0),
  referenceYear: t.integer("reference_year").notNull().default(sql`(strftime('%Y', 'now'))`),
  userId: t.text("user_id").references(() => users.id, { onDelete: "cascade" }),
  createdAt: t.integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
}), (table) => ({
  categoryYearUnique: uniqueIndex("category_limits_year_unique").on(table.category, table.referenceYear),
}));

/**
 * Subscriptions table
 */
export const subscriptions = sqliteTable("subscriptions", (t) => ({
  id: t.text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: t.text("user_id").references(() => users.id, { onDelete: "cascade" }),
  status: t.text("status").notNull(),
  planId: t.text("plan_id"),
  currentPeriodStart: t.integer("current_period_start", { mode: "timestamp" }),
  currentPeriodEnd: t.integer("current_period_end", { mode: "timestamp" }),
  stripeCustomerId: t.text("stripe_customer_id"),
  stripeSubscriptionId: t.text("stripe_subscription_id"),
  createdAt: t.integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
}));
