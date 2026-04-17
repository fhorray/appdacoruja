"use client";

import { useQuery } from '@tanstack/react-query';
import { getInvoiceDetailsAction } from '@/server/actions/credit-card-actions';
import { CustomSheet } from '../custom-sheet';
import { formatCurrency } from '@/lib/utils';
import { Button } from '../ui/button';
import { useCreditCards } from '@/hooks/use-credit-cards';
import { Loader2, Calendar, CreditCard, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface InvoiceDetailSheetProps {
  cardId: string;
  referenceMonth: string;
  isOpen: boolean;
  onClose: () => void;
}

export function InvoiceDetailSheet({ cardId, referenceMonth, isOpen, onClose }: InvoiceDetailSheetProps) {
  const { payInvoice } = useCreditCards();

  const { data, isLoading } = useQuery({
    queryKey: ['invoice', cardId, referenceMonth],
    queryFn: () => getInvoiceDetailsAction(cardId, referenceMonth),
    enabled: isOpen && !!cardId && !!referenceMonth,
  });

  if (!isOpen) return null;

  return (
    <CustomSheet
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title={data?.card ? `Fatura ${data.card.name}` : 'Detalhes da Fatura'}
      className="px-4 !max-w-xl"
      content={({ close }) => {
        // override close to also call our prop onClose
        const handleClose = () => {
          close();
          onClose();
        };

        return (
          <div className="px-4 flex flex-col h-full bg-background mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : !data ? (
              <div className="text-center p-8 text-muted-foreground">Erro ao carregar fatura.</div>
            ) : (
              <>
                <div className="space-y-6 flex-1 overflow-y-auto pb-24">
                  {/* Header Info */}
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-md">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Valor Total</h3>
                      <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                        {formatCurrency(data.invoice ? data.invoice.totalAmount : data.calculatedTotal)}
                      </p>
                    </div>
                    <div className="text-right">
                      <h3 className="text-sm font-medium text-muted-foreground">Vencimento</h3>
                      <div className="flex items-center justify-end gap-1.5 text-sm font-medium mt-1">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>Dia {data.card.dueDay}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status da Fatura:</span>
                    {data.invoice?.status === 'paid' ? (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider">
                        Paga
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wider">
                        Aberta
                      </span>
                    )}
                  </div>

                  {/* Transactions List */}
                  <div>
                    <h4 className="font-bold flex items-center gap-2 mb-4 text-sm uppercase tracking-wide text-muted-foreground">
                      <CreditCard className="w-4 h-4" />
                      Lançamentos do Mês
                    </h4>

                    {data.transactions.length === 0 ? (
                      <div className="text-center p-8 border rounded-md border-dashed">
                        <p className="text-sm text-muted-foreground">Nenhuma transação nesta fatura.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {data.transactions.map((t: any) => (
                          <div key={t.id} className="flex justify-between items-center p-3 hover:bg-muted/50 rounded-lg transition-colors group cursor-default">
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">{t.description}</span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(t.date), "dd/MM/yyyy", { locale: ptBR })} • {t.category}
                              </span>
                            </div>
                            <span className="font-bold text-sm">
                              {formatCurrency(Number(t.amount))}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer fixed */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t">
                  <Button
                    className="h-12 text-base font-medium shadow-lg hover:shadow-xl transition-all"
                    disabled={data.invoice?.status === 'paid' || data.transactions.length === 0 || payInvoice.isPending}
                    onClick={async () => {
                      if (data.invoice?.status === 'paid') return;
                      await payInvoice.mutateAsync({
                        cardId: data.card.id,
                        referenceMonth: data.referenceMonth,
                        amount: data.calculatedTotal
                      });
                    }}
                  >
                    {payInvoice.isPending ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processando...</>
                    ) : data.invoice?.status === 'paid' ? (
                      'Fatura Paga'
                    ) : (
                      'Marcar como Paga'
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        );
      }}
    />
  );
}
