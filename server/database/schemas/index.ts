import { users, sessions } from "./auth";
import { transactions, categories, responsiblePersons, categoryLimits, subscriptions } from "./finance";
import { retirementConfigs, financialProjects } from "./investments";
import { savingsGoals } from "./savings-goals";
import { recurringBills } from "./recurring-bills";
import { creditCards, creditCardInvoices } from "./credit-cards";

// Barrel exports
export * from "./auth";
export * from "./finance";
export * from "./investments";
export * from "./savings-goals";
export * from "./recurring-bills";
export * from "./credit-cards";

// --- Database Types (Select) ---
export type SelectUser = typeof users.$inferSelect;
export type SelectSession = typeof sessions.$inferSelect;
export type SelectTransaction = typeof transactions.$inferSelect;
export type SelectCategory = typeof categories.$inferSelect;
export type SelectResponsiblePerson = typeof responsiblePersons.$inferSelect;
export type SelectCategoryLimit = typeof categoryLimits.$inferSelect;
export type SelectSubscription = typeof subscriptions.$inferSelect;
export type SelectRetirementConfig = typeof retirementConfigs.$inferSelect;
export type SelectFinancialProject = typeof financialProjects.$inferSelect;
export type SelectSavingsGoal = typeof savingsGoals.$inferSelect;
export type SelectRecurringBill = typeof recurringBills.$inferSelect;
export type SelectCreditCard = typeof creditCards.$inferSelect;
export type SelectCreditCardInvoice = typeof creditCardInvoices.$inferSelect;

// --- Database Types (Insert) ---
export type InsertUser = typeof users.$inferInsert;
export type InsertTransaction = typeof transactions.$inferInsert;
export type InsertCategory = typeof categories.$inferInsert;
export type InsertResponsiblePerson = typeof responsiblePersons.$inferInsert;
export type InsertCategoryLimit = typeof categoryLimits.$inferInsert;
export type InsertSubscription = typeof subscriptions.$inferInsert;
export type InsertRetirementConfig = typeof retirementConfigs.$inferInsert;
export type InsertFinancialProject = typeof financialProjects.$inferInsert;
export type InsertSavingsGoal = typeof savingsGoals.$inferInsert;
export type InsertRecurringBill = typeof recurringBills.$inferInsert;
export type InsertCreditCard = typeof creditCards.$inferInsert;
export type InsertCreditCardInvoice = typeof creditCardInvoices.$inferInsert;