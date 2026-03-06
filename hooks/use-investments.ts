import {
  createFinancialProjectAction,
  deleteFinancialProjectAction,
  getFinancialProjectsAction,
  getRetirementConfigAction,
  updateFinancialProjectAction,
  upsertRetirementConfigAction
} from "@/server/actions"
import { useMutation, useQuery } from "@tanstack/react-query"

export const useInvestments = (userId: string) => {
  // --- Retirement Configuration ---
  const retirementConfigQuery = useQuery({
    queryKey: ['retirement-config', userId],
    queryFn: () => getRetirementConfigAction(),
    enabled: !!userId,
  });

  const upsertRetirementConfig = useMutation({
    mutationFn: upsertRetirementConfigAction
  });

  // --- Financial Projects ---
  const financialProjectsQuery = useQuery({
    queryKey: ['financial-projects', userId],
    queryFn: () => getFinancialProjectsAction(),
    enabled: !!userId,
  });

  const createFinancialProject = useMutation({
    mutationFn: createFinancialProjectAction
  });

  const updateFinancialProject = useMutation({
    mutationFn: updateFinancialProjectAction
  });

  const deleteFinancialProject = useMutation({
    mutationFn: deleteFinancialProjectAction
  });

  return {
    // Retirement Config
    retirementConfigQuery,
    upsertRetirementConfig,

    // Financial Projects
    financialProjectsQuery,
    createFinancialProject,
    updateFinancialProject,
    deleteFinancialProject
  }
}
