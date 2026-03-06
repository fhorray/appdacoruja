import { users } from "./auth";
import { transactions, categories, responsiblePersons, categoryLimits, subscriptions } from "./finance";
import { retirementConfigs, financialProjects } from "./investments";

// Barrel exports
export * from "./auth";
export * from "./finance";
export * from "./investments";

// --- Database Types (Select) ---
export type SelectUser = typeof users.$inferSelect;
export type SelectTransaction = typeof transactions.$inferSelect;
export type SelectCategory = typeof categories.$inferSelect;
export type SelectResponsiblePerson = typeof responsiblePersons.$inferSelect;
export type SelectCategoryLimit = typeof categoryLimits.$inferSelect;
export type SelectSubscription = typeof subscriptions.$inferSelect;
export type SelectRetirementConfig = typeof retirementConfigs.$inferSelect;
export type SelectFinancialProject = typeof financialProjects.$inferSelect;

// --- Database Types (Insert) ---
export type InsertUser = typeof users.$inferInsert;
export type InsertTransaction = typeof transactions.$inferInsert;
export type InsertCategory = typeof categories.$inferInsert;
export type InsertResponsiblePerson = typeof responsiblePersons.$inferInsert;
export type InsertCategoryLimit = typeof categoryLimits.$inferInsert;
export type InsertSubscription = typeof subscriptions.$inferInsert;
export type InsertRetirementConfig = typeof retirementConfigs.$inferInsert;
export type InsertFinancialProject = typeof financialProjects.$inferInsert;