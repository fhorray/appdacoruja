import {
  createCategoryAction,
  createResponsiblePersonAction,
  createTransactionAction,
  deleteCategoryAction,
  deleteResponsiblePersonAction,
  deleteTransactionAction,
  getCategoriesAction,
  getCategoryLimitsAction,
  getResponsiblePersonsAction,
  getTransactionsAction,
  updateCategoryAction,
  updateResponsiblePersonAction,
  updateTransactionAction,
  upsertCategoryLimitAction
} from "@/server/actions"
import { useMutation, useQuery } from "@tanstack/react-query"

export const useFinance = (userId?: string) => {
  // --- Transactions ---
  const transactionsQuery = useQuery({
    queryKey: ['transactions', userId],
    queryFn: () => getTransactionsAction(userId),
  });

  const createTransaction = useMutation({
    mutationFn: createTransactionAction
  });

  const updateTransaction = useMutation({
    mutationFn: updateTransactionAction
  });

  const deleteTransaction = useMutation({
    mutationFn: deleteTransactionAction
  });

  // --- Categories ---
  const categoriesQuery = useQuery({
    queryKey: ['categories', userId],
    queryFn: () => getCategoriesAction(userId),
  });

  const createCategory = useMutation({
    mutationFn: createCategoryAction
  });

  const updateCategory = useMutation({
    mutationFn: updateCategoryAction
  });

  const deleteCategory = useMutation({
    mutationFn: deleteCategoryAction
  });

  // --- Responsible Persons ---
  const responsiblePersonsQuery = useQuery({
    queryKey: ['responsible-persons', userId],
    queryFn: () => getResponsiblePersonsAction(userId),
  });

  const createResponsiblePerson = useMutation({
    mutationFn: createResponsiblePersonAction
  });

  const updateResponsiblePerson = useMutation({
    mutationFn: updateResponsiblePersonAction
  });

  const deleteResponsiblePerson = useMutation({
    mutationFn: deleteResponsiblePersonAction
  });

  // --- Category Limits ---
  const categoryLimitsQuery = useQuery({
    queryKey: ['category-limits', userId],
    queryFn: () => getCategoryLimitsAction(userId),
  });

  const upsertCategoryLimit = useMutation({
    mutationFn: upsertCategoryLimitAction
  });

  return {
    // Transactions
    transactionsQuery,
    createTransaction,
    updateTransaction,
    deleteTransaction,

    // Categories
    categoriesQuery,
    createCategory,
    updateCategory,
    deleteCategory,

    // Responsible Persons
    responsiblePersonsQuery,
    createResponsiblePerson,
    updateResponsiblePerson,
    deleteResponsiblePerson,

    // Limits
    categoryLimitsQuery,
    upsertCategoryLimit
  }
}