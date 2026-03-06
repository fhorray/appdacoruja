import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getRecurringBillsAction, 
  createRecurringBillAction, 
  updateRecurringBillAction, 
  deleteRecurringBillAction 
} from "@/server/actions/recurring-bills-actions";
import { toast } from "sonner";

export function useRecurringBills(userId: string) {
  const queryClient = useQueryClient();

  const recurringBillsQuery = useQuery({
    queryKey: ['recurring-bills', userId],
    queryFn: () => getRecurringBillsAction(),
    enabled: !!userId,
  });

  const createRecurringBill = useMutation({
    mutationFn: (data: any) => createRecurringBillAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-bills', userId] });
      toast.success("Conta fixa criada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao criar conta fixa.");
    }
  });

  const updateRecurringBill = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => updateRecurringBillAction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-bills', userId] });
      toast.success("Conta fixa atualizada!");
    },
    onError: () => {
      toast.error("Erro ao atualizar conta fixa.");
    }
  });

  const deleteRecurringBill = useMutation({
    mutationFn: (id: string) => deleteRecurringBillAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-bills', userId] });
      toast.success("Conta fixa removida.");
    },
    onError: () => {
      toast.error("Erro ao remover conta fixa.");
    }
  });

  return {
    recurringBillsQuery,
    createRecurringBill,
    updateRecurringBill,
    deleteRecurringBill
  };
}
