"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRecurringBills } from "@/hooks/use-recurring-bills";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { CalendarClock, Plus, Receipt, CreditCard, Filter } from "lucide-react";
import { RecurringBillCard } from "@/components/finance/recurring-bill-card";
import { RecurringBillFormSheet } from "@/components/finance/recurring-bill-form-sheet";
import { PaymentCalendar } from "@/components/finance/payment-calendar";
import { EmptyState } from "@/components/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SelectRecurringBill } from "@/server/database/schemas";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BillsPage() {
  const { user } = useAuth();
  const userId = user?.id as string;
  const { recurringBillsQuery, deleteRecurringBill } = useRecurringBills(userId || "");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<SelectRecurringBill | null>(null);
  const [billToDelete, setBillToDelete] = useState<string | null>(null);

  const bills = recurringBillsQuery.data || [];
  const isLoading = recurringBillsQuery.isLoading;

  const handleEdit = (bill: SelectRecurringBill) => {
    setSelectedBill(bill);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedBill(null);
  };

  const handleDelete = async () => {
    if (billToDelete) {
      await deleteRecurringBill.mutateAsync(billToDelete);
      setBillToDelete(null);
    }
  };

  const totalCommitted = bills
    .filter(b => b.isActive)
    .reduce((sum, b) => sum + Number(b.amount), 0);

  const subscriptions = bills.filter(b => b.type === "subscription");
  const fixedBills = bills.filter(b => b.type === "fixed_bill");

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader 
          title="Contas Fixas & Assinaturas" 
          description="Gerencie seus gastos recorrentes e tenha previsibilidade financeira."
        />
        <Button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Nova Conta
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Filters and List */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="all" className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <TabsList className="bg-muted/50 p-1">
                    <TabsTrigger value="all" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Todas</TabsTrigger>
                    <TabsTrigger value="fixed" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Contas Fixas</TabsTrigger>
                    <TabsTrigger value="subs" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Assinaturas</TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-3 px-4 py-2 bg-primary/5 border border-primary/20 rounded-xl text-primary font-medium text-sm">
                    <CalendarClock className="w-4 h-4 shrink-0" />
                    <span>Total Mensal: {formatCurrency(totalCommitted)}</span>
                </div>
            </div>

            <TabsContent value="all" className="mt-0 space-y-4">
              {bills.length === 0 && !isLoading ? (
                <EmptyState 
                  icon={CalendarClock} 
                  title="Nenhuma conta recorrente" 
                  description="Comece adicionando suas assinaturas de streaming, contas de luz ou aluguel." 
                  action={<Button onClick={() => setIsFormOpen(true)} variant="outline" size="sm">Adicionar Primeiro</Button>}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bills.map(bill => (
                    <RecurringBillCard 
                      key={bill.id} 
                      bill={bill} 
                      onEdit={() => handleEdit(bill)}
                      onDelete={() => setBillToDelete(bill.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="fixed" className="mt-0">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fixedBills.map(bill => (
                    <RecurringBillCard 
                      key={bill.id} 
                      bill={bill} 
                      onEdit={() => handleEdit(bill)}
                      onDelete={() => setBillToDelete(bill.id)}
                    />
                  ))}
                  {fixedBills.length === 0 && (
                      <p className="text-center text-muted-foreground py-10 col-span-full">Nenhuma conta fixa encontrada.</p>
                  )}
                </div>
            </TabsContent>

            <TabsContent value="subs" className="mt-0">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subscriptions.map(bill => (
                    <RecurringBillCard 
                      key={bill.id} 
                      bill={bill} 
                      onEdit={() => handleEdit(bill)}
                      onDelete={() => setBillToDelete(bill.id)}
                    />
                  ))}
                  {subscriptions.length === 0 && (
                      <p className="text-center text-muted-foreground py-10 col-span-full">Nenhuma assinatura encontrada.</p>
                  )}
                </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right column: Calendar and Summary */}
        <div className="space-y-6">
            <PaymentCalendar bills={bills} />

            <Card className="bg-primary/5 border-primary/10 shadow-none">
                <CardHeader>
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Receipt className="w-4 h-4" />
                        Resumo de Comprometimento
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Contas Fixas</span>
                        <span className="font-semibold">{formatCurrency(fixedBills.reduce((s, b) => s + b.amount, 0))}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Assinaturas</span>
                        <span className="font-semibold">{formatCurrency(subscriptions.reduce((s, b) => s + b.amount, 0))}</span>
                    </div>
                    <div className="pt-3 border-t flex justify-between items-center font-bold text-primary">
                        <span>Total Mensal</span>
                        <span className="text-lg">{formatCurrency(totalCommitted)}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
                        Este valor é subtraído automaticamente de suas previsões de saldo para garantir que você nunca fique sem dinheiro para o essencial.
                    </p>
                </CardContent>
            </Card>
        </div>
      </div>

      <RecurringBillFormSheet 
        isOpen={isFormOpen} 
        onClose={handleCloseForm} 
        userId={userId} 
        initialData={selectedBill}
      />

      <AlertDialog open={!!billToDelete} onOpenChange={(open) => !open && setBillToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conta fixa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A conta será removida permanentemente de suas previsões.
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
