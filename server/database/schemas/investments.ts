import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { users } from "./auth";

/**
 * Retirement configurations table
 */
export const retirementConfigs = sqliteTable("retirement_configs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  currentAge: integer("current_age").notNull().default(30),
  retirementAge: integer("retirement_age").notNull().default(65),
  desiredMonthlyIncome: real("desired_monthly_income").notNull().default(10000.00),
  otherFutureIncomes: real("other_future_incomes").notNull().default(0.00),
  monthlyInvestment: real("monthly_investment").notNull().default(1000.00),
  accumulationRate: real("accumulation_rate").notNull().default(10.00),
  retirementRate: real("retirement_rate").notNull().default(6.00),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

/**
 * Financial projects table
 */
export const financialProjects = sqliteTable("financial_projects", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  targetValue: real("target_value").notNull(),
  accumulatedValue: real("accumulated_value").notNull().default(0.00),
  targetDate: text("target_date").notNull(), // SQLite date is usually text
  estimatedYield: real("estimated_yield").notNull().default(10.00),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
