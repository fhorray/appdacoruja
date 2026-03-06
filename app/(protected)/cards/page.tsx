"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCreditCards } from "@/hooks/use-credit-cards";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Plus, CreditCard, ChevronRight } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { SelectCreditCard } from "@/server/database/schemas";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { CreditCardFormSheet } from "@/components/finance/credit-card-form-sheet";
import { InvoiceDetailSheet } from "@/components/finance/invoice-detail-sheet";

export default function CardsPage() {
  const { user } = useAuth();
  const userId = user?.id as string;
  
  const { creditCardsQuery, deleteCreditCard } = useCreditCards();
  const cards = creditCardsQuery.data || [];
  const isLoading = creditCardsQuery.isLoading;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<SelectCreditCard | null>(null);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);

  const [invoiceSheetOpen, setInvoiceSheetOpen] = useState(false);
  const [selectedCardForInvoice, setSelectedCardForInvoice] = useState<string | null>(null);

  // default to current month
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [referenceMonth, setReferenceMonth] = useState(currentMonthStr);

  const handleEdit = (card: SelectCreditCard, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCard(card);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedCard(null);
  };

  const handleDelete = async () => {
    if (cardToDelete) {
      await deleteCreditCard.mutateAsync(cardToDelete);
      setCardToDelete(null);
    }
  };

  const openInvoice = (cardId: string) => {
    setSelectedCardForInvoice(cardId);
    setInvoiceSheetOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader 
          title="Cartões de Crédito" 
          description="Gerencie seus cartões e acompanhe suas faturas em tempo real."
        />
        <Button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Novo Cartão
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
            <p className="text-muted-foreground p-4">Carregando cartões...</p>
        ) : cards.length === 0 ? (
          <div className="col-span-full">
            <EmptyState 
              icon={CreditCard} 
              title="Nenhum cartão cadastrado" 
              description="Adicione seu primeiro cartão de crédito para acompanhar seus gastos e faturas." 
              action={<Button onClick={() => setIsFormOpen(true)} variant="outline" size="sm">Adicionar Primeiro</Button>}
            />
          </div>
        ) : (
          cards.map(card => {
            // Emulate used limit for this view since we don't have the summary here 
            // In a real app we might want to return the actual used amount in the getCreditCardsAction 
            // but for now we just show the card info, clicking opens the invoice detail which fetches exact totals
            return (
              <Card 
                key={card.id} 
                className="group relative overflow-hidden cursor-pointer hover:shadow-md transition-all border-primary/10"
                onClick={() => openInvoice(card.id)}
              >
                <div 
                    className="absolute top-0 left-0 w-1.5 h-full"
                    style={{ backgroundColor: card.color || 'var(--primary)' }}
                />
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-lg font-bold">{card.name}</CardTitle>
                            <CardDescription className="uppercase text-xs font-bold tracking-wider mt-1">
                                {card.brand} {card.lastFourDigits && `• ${card.lastFourDigits}`}
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => handleEdit(card, e)}
                            >
                                Editar
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                        <div className="space-y-1">
                            <span className="text-muted-foreground text-xs block">Fechamento</span>
                            <span className="font-semibold">Dia {card.closingDay}</span>
                        </div>
                        <div className="space-y-1">
                            <span className="text-muted-foreground text-xs block">Vencimento</span>
                            <span className="font-semibold">Dia {card.dueDay}</span>
                        </div>
                    </div>
                    
                    <div className="pt-4 border-t border-dashed flex items-center justify-between text-muted-foreground group-hover:text-primary transition-colors">
                        <span className="text-sm font-medium">Ver fatura atual</span>
                        <ChevronRight className="w-4 h-4" />
                    </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <CreditCardFormSheet 
        isOpen={isFormOpen} 
        onClose={handleCloseForm} 
        userId={userId} 
        initialData={selectedCard}
        mode={selectedCard ? 'edit' : 'create'}
      />

      {selectedCardForInvoice && (
        <InvoiceDetailSheet
          cardId={selectedCardForInvoice}
          referenceMonth={referenceMonth}
          isOpen={invoiceSheetOpen}
          onClose={() => {
            setInvoiceSheetOpen(false);
            setTimeout(() => setSelectedCardForInvoice(null), 300);
          }}
        />
      )}

      <AlertDialog open={!!cardToDelete} onOpenChange={(open) => !open && setCardToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cartão?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá o cartão e desvinculará todas as compras a ele associadas. Suas faturas antigas e o saldo não serão apagados. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
