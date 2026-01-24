import { pgTable, text, timestamp, numeric, integer, boolean, uuid, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./auth";

/**
 * Transaction type enum: expense or income
 */
export const transactionTypeEnum = pgEnum("transaction_type", ["expense", "income"]);

/**
 * Recurrence type enum: single or monthly until December
 */
export const recurrenceTypeEnum = pgEnum("recurrence_type", ["single", "monthly_until_december"]);

/**
 * Categories table
 * Maps to 'categories' (was categorias)
 */
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  type: text("type").notNull().default("expense"), // expense, income
  isActive: boolean("is_active").default(true),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    nameTypeUnique: sql`UNIQUE(${table.name}, ${table.type})`,
  };
});

/**
 * Responsible persons table
 * Maps to 'responsible_persons' (was responsaveis)
 */
export const responsiblePersons = pgTable("responsible_persons", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  isActive: boolean("is_active").default(true),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    nameUnique: sql`UNIQUE(${table.name})`,
  };
});

/**
 * Transactions table
 * Maps to 'transactions' (was transacoes)
 */
export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: text("type").notNull().default("expense"), // expense, income
  date: timestamp("date").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  status: text("status"),
  paymentMethod: text("payment_method"),
  responsible: text("responsible"),
  location: text("location"),
  month: text("month").notNull(),
  year: integer("year").notNull(),
  isRecurrent: boolean("is_recurrent").notNull().default(false),
  recurrenceType: text("recurrence_type").default("single"),
  recurrenceGroup: uuid("recurrence_group"),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

/**
 * Category limits table
 * Maps to 'category_limits' (was limites_categoria)
 */
export const categoryLimits = pgTable("category_limits", {
  id: uuid("id").primaryKey().defaultRandom(),
  category: text("category").notNull(),
  monthlyLimit: numeric("monthly_limit", { precision: 10, scale: 2 }).default("0"),
  annualLimit: numeric("annual_limit", { precision: 10, scale: 2 }).default("0"),
  referenceYear: integer("reference_year").notNull().default(sql`EXTRACT(YEAR FROM CURRENT_DATE)`),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    categoryYearUnique: sql`UNIQUE(${table.category}, ${table.referenceYear})`,
  };
});

/**
 * Subscriptions table
 * Maps to 'subscriptions' (was stripe_user_subscriptions)
 * simplified for migration
 */
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  status: text("status").notNull(), // active, past_due, canceled, incomplete, incomplete_expired, trialing, unpaid
  planId: text("plan_id"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
});
