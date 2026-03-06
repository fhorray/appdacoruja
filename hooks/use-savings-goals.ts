import {
  createSavingsGoalAction,
  deleteSavingsGoalAction,
  getSavingsGoalsAction,
  updateSavingsGoalAction,
  addOrWithdrawFromSavingsGoalAction
} from "@/server/actions"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const useSavingsGoals = (userId?: string) => {
  const queryClient = useQueryClient();

  // --- Savings Goals ---
  const savingsGoalsQuery = useQuery({
    queryKey: ['savings-goals', userId],
    queryFn: () => getSavingsGoalsAction(userId),
    enabled: !!userId,
  });

  const createSavingsGoal = useMutation({
    mutationFn: createSavingsGoalAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals', userId] });
    }
  });

  const updateSavingsGoal = useMutation({
    mutationFn: updateSavingsGoalAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals', userId] });
    }
  });

  const deleteSavingsGoal = useMutation({
    mutationFn: deleteSavingsGoalAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals', userId] });
    }
  });

  const updateGoalAmount = useMutation({
    mutationFn: addOrWithdrawFromSavingsGoalAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals', userId] });
    }
  });

  return {
    savingsGoalsQuery,
    createSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    updateGoalAmount
  }
}
