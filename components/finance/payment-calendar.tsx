"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SelectRecurringBill } from "@/server/database/schemas";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PaymentCalendarProps {
  bills: SelectRecurringBill[];
}

export function PaymentCalendar({ bills }: PaymentCalendarProps) {
  const today = new Date();
  const currentMonthName = format(today, 'MMMM', { locale: ptBR });
  const currentDay = today.getDate();

  // Create an array for days of the month (simplified 31 days)
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const getBillsForDay = (day: number) => {
    return bills.filter(b => b.dueDay === day && b.isActive);
  };

  return (
    <Card className="shadow-sm overflow-hidden">
      <CardHeader className="bg-muted/30 border-b pb-4">
        <CardTitle className="text-base font-semibold flex items-center justify-between">
          Calendário de Vencimentos
          <span className="text-xs font-normal text-muted-foreground capitalize">
            {currentMonthName} {today.getFullYear()}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <TooltipProvider>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => {
              const dayBills = getBillsForDay(day);
              const hasBills = dayBills.length > 0;
              const isToday = day === currentDay;
              const isPast = day < currentDay;

              return (
                <Tooltip key={day}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "h-12 flex flex-col items-center justify-center rounded-md border text-sm transition-all relative cursor-default",
                        isToday ? "border-primary bg-primary/5 font-bold text-primary ring-1 ring-primary" :
                          hasBills ? "border-muted-foreground/20 bg-background hover:bg-muted/20" :
                            "border-transparent bg-muted/10 text-muted-foreground/50 opacity-50"
                      )}
                    >
                      <span className={cn(
                        "z-10",
                        isToday ? "text-primary" : hasBills ? "text-foreground" : ""
                      )}>
                        {day}
                      </span>

                      {hasBills && (
                        <div className="flex gap-0.5 mt-1 -mb-1">
                          {dayBills.slice(0, 3).map((bill, i) => (
                            <div
                              key={bill.id}
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: bill.color || "#3b82f6" }}
                            />
                          ))}
                          {dayBills.length > 3 && (
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          )}
                        </div>
                      )}

                      {isToday && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                      )}
                    </div>
                  </TooltipTrigger>
                  {hasBills && (
                    <TooltipContent side="top" className="p-3 space-y-2 max-w-[200px]">
                      <p className="font-bold text-xs uppercase tracking-wider text-muted-foreground border-b pb-1">
                        Vencendo dia {day}
                      </p>
                      {dayBills.map(bill => (
                        <div key={bill.id} className="flex items-center justify-between gap-3 text-sm">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: bill.color || "#3b82f6" }} />
                            <span className="truncate">{bill.name}</span>
                          </div>
                          <span className="font-semibold shrink-0">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(bill.amount)}
                          </span>
                        </div>
                      ))}
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>

        <div className="mt-6 flex flex-wrap gap-4 text-[10px] sm:text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-primary/10 border border-primary" />
            <span className="text-muted-foreground">Hoje</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-background border border-muted-foreground/20" />
            <span className="text-muted-foreground">Com Conta</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">Assinatura / Conta Fixa</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
