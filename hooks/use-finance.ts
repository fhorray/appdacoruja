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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const useFinance = (userId?: string) => {
  const queryClient = useQueryClient();

  // --- Transactions ---
  const transactionsQuery = useQuery({
    queryKey: ['transactions', userId],
    queryFn: () => getTransactionsAction(userId),
    enabled: !!userId,
  });

  const createTransaction = useMutation({
    mutationFn: createTransactionAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', userId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
    }
  });

  const updateTransaction = useMutation({
    mutationFn: updateTransactionAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', userId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
    }
  });

  const deleteTransaction = useMutation({
    mutationFn: deleteTransactionAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', userId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
    }
  });

  // --- Categories ---
  const categoriesQuery = useQuery({
    queryKey: ['categories', userId],
    queryFn: () => getCategoriesAction(userId),
    enabled: !!userId,
  });

  const createCategory = useMutation({
    mutationFn: createCategoryAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', userId] });
    }
  });

  const updateCategory = useMutation({
    mutationFn: updateCategoryAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', userId] });
    }
  });

  const deleteCategory = useMutation({
    mutationFn: deleteCategoryAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', userId] });
    }
  });

  // --- Responsible Persons ---
  const responsiblePersonsQuery = useQuery({
    queryKey: ['responsible-persons', userId],
    queryFn: () => getResponsiblePersonsAction(userId),
    enabled: !!userId,
  });

  const createResponsiblePerson = useMutation({
    mutationFn: createResponsiblePersonAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['responsible-persons', userId] });
    }
  });

  const updateResponsiblePerson = useMutation({
    mutationFn: updateResponsiblePersonAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['responsible-persons', userId] });
    }
  });

  const deleteResponsiblePerson = useMutation({
    mutationFn: deleteResponsiblePersonAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['responsible-persons', userId] });
    }
  });

  // --- Category Limits ---
  const categoryLimitsQuery = useQuery({
    queryKey: ['category-limits', userId],
    queryFn: () => getCategoryLimitsAction(userId),
    enabled: !!userId,
  });

  const upsertCategoryLimit = useMutation({
    mutationFn: upsertCategoryLimitAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['category-limits', userId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
    }
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
