"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CreditCard, Plus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CreditCardSummaryData {
  totalLimit: number;
  totalUsed: number;
  cards: {
    id: string;
    name: string;
    brand: string;
    color: string | null;
    limit: number;
    used: number;
    dueDay: number;
    closingDay: number;
  }[];
}

interface CreditCardWidgetProps {
  summary?: CreditCardSummaryData;
}

export function CreditCardWidget({ summary }: CreditCardWidgetProps) {
  if (!summary || summary.cards.length === 0) {
    return (
      <Card className="col-span-full md:col-span-1 shadow-sm border-primary/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            Cartões de Crédito
          </CardTitle>
          <CardDescription>Gerencie suas faturas</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6 gap-4">
          <p className="text-sm text-muted-foreground text-center">
            Você ainda não cadastrou nenhum cartão de crédito.
          </p>
          <Link href="/cards">
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Adicionar Cartão
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const overallPercentage = summary.totalLimit > 0 ? (summary.totalUsed / summary.totalLimit) * 100 : 0;

  return (
    <Card className="col-span-full md:col-span-1 shadow-sm border-primary/10 flex flex-col">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            Cartões de Crédito
          </CardTitle>
          <CardDescription>Resumo das faturas atuais</CardDescription>
        </div>
        <Link href="/cards">
          <Button variant="ghost" size="sm" className="text-xs">
            Ver Todos
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="flex-1 space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Limite Utilizado</span>
            <span className="font-medium">
              {formatCurrency(summary.totalUsed)} / {formatCurrency(summary.totalLimit)}
            </span>
          </div>
          <Progress 
            value={overallPercentage} 
            className="h-2" 
            indicatorClassName={overallPercentage > 80 ? "bg-red-500" : overallPercentage > 50 ? "bg-amber-500" : "bg-primary"}
          />
        </div>

        <div className="space-y-4">
          {summary.cards.map(card => {
            const perc = card.limit > 0 ? (card.used / card.limit) * 100 : 0;
            return (
              <div key={card.id} className="space-y-1.5 relative">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: card.color || 'var(--primary)' }} 
                    />
                    <span className="text-sm font-medium">{card.name}</span>
                  </div>
                  <span className="text-sm font-bold">{formatCurrency(card.used)}</span>
                </div>
                <Progress 
                  value={perc} 
                  className="h-1.5 bg-muted" 
                  indicatorClassName={perc > 80 ? "bg-red-500" : "bg-primary"}
                  style={perc <= 80 && card.color ? { backgroundColor: card.color } : {}}
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Vence dia {card.dueDay}</span>
                  <span>Lim. {formatCurrency(card.limit)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
