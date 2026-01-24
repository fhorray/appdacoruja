import { pgTable, text, timestamp, integer, boolean, uuid, decimal, date } from "drizzle-orm/pg-core";
import { users } from "./auth";

/**
 * Retirement configurations table
 * Maps to 'retirement_configs' (was configuracoes_aposentadoria)
 */
export const retirementConfigs = pgTable("retirement_configs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  currentAge: integer("current_age").notNull().default(30),
  retirementAge: integer("retirement_age").notNull().default(65),
  desiredMonthlyIncome: decimal("desired_monthly_income", { precision: 15, scale: 2 }).notNull().default("10000.00"),
  otherFutureIncomes: decimal("other_future_incomes", { precision: 15, scale: 2 }).notNull().default("0.00"),
  monthlyInvestment: decimal("monthly_investment", { precision: 15, scale: 2 }).notNull().default("1000.00"),
  accumulationRate: decimal("accumulation_rate", { precision: 5, scale: 2 }).notNull().default("10.00"),
  retirementRate: decimal("retirement_rate", { precision: 5, scale: 2 }).notNull().default("6.00"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Financial projects table
 * Maps to 'financial_projects' (was projetos_financeiros)
 */
export const financialProjects = pgTable("financial_projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  targetValue: decimal("target_value", { precision: 15, scale: 2 }).notNull(),
  accumulatedValue: decimal("accumulated_value", { precision: 15, scale: 2 }).notNull().default("0.00"),
  targetDate: date("target_date").notNull(),
  estimatedYield: decimal("estimated_yield", { precision: 5, scale: 2 }).notNull().default("10.00"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
