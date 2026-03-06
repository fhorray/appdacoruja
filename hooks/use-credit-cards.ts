"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCreditCardsAction, createCreditCardAction, updateCreditCardAction, deleteCreditCardAction, getInvoiceDetailsAction, payInvoiceAction } from "@/server/actions/credit-card-actions";
import { toast } from "sonner";
import { InsertCreditCard, SelectCreditCard } from "@/server/database/schemas";

export function useCreditCards() {
  const queryClient = useQueryClient();

  const creditCardsQuery = useQuery({
    queryKey: ["credit-cards"],
    queryFn: () => getCreditCardsAction(),
  });

  const createCreditCard = useMutation({
    mutationFn: (data: InsertCreditCard) => createCreditCardAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit-cards"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
      toast.success("Cartão criado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao criar cartão.");
    },
  });

  const updateCreditCard = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertCreditCard> }) => updateCreditCardAction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit-cards"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
      toast.success("Cartão atualizado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar cartão.");
    },
  });

  const deleteCreditCard = useMutation({
    mutationFn: (id: string) => deleteCreditCardAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit-cards"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
      toast.success("Cartão excluído com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao excluir cartão.");
    },
  });

  const payInvoice = useMutation({
    mutationFn: ({ cardId, referenceMonth, amount }: { cardId: string, referenceMonth: string, amount: number }) => payInvoiceAction(cardId, referenceMonth, amount),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["credit-cards"] });
      queryClient.invalidateQueries({ queryKey: ["invoice", variables.cardId, variables.referenceMonth] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
      toast.success("Fatura marcada como paga!");
    },
    onError: () => {
      toast.error("Erro ao pagar fatura.");
    },
  });

  return {
    creditCardsQuery,
    createCreditCard,
    updateCreditCard,
    deleteCreditCard,
    payInvoice
  };
}
