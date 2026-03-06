"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CalendarClock, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Calendar, 
  Tag, 
  AlertCircle,
  CreditCard,
  Receipt
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { SelectRecurringBill } from "@/server/database/schemas";
import { cn } from "@/lib/utils";

interface RecurringBillCardProps {
  bill: SelectRecurringBill;
  onEdit: () => void;
  onDelete: () => void;
}

export function RecurringBillCard({ bill, onEdit, onDelete }: RecurringBillCardProps) {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const today = new Date().getDate();
  const isNearDue = bill.dueDay >= today && bill.dueDay <= today + 3;
  const isOverdue = bill.dueDay < today;

  return (
    <Card className="hover:shadow-md transition-shadow group relative overflow-hidden">
      {/* Indicative Color Bar */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1.5" 
        style={{ backgroundColor: bill.color || "#3b82f6" }}
      />

      <CardContent className="p-5 pl-7">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="p-2.5 rounded-xl text-white shadow-sm"
              style={{ backgroundColor: bill.color || "#3b82f6" }}
            >
              {bill.type === "subscription" ? (
                <CreditCard className="w-5 h-5" />
              ) : (
                <Receipt className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {bill.name}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                <Tag className="w-3 h-3" />
                {bill.category}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit2 className="w-4 h-4 mr-2" /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-end justify-between mt-6">
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Valor Mensal
            </span>
            <div className="text-xl font-bold text-foreground">
              {formatCurrency(bill.amount)}
            </div>
          </div>

          <div className={cn(
            "flex flex-col items-end gap-1 px-3 py-1.5 rounded-lg border transition-colors",
            isNearDue ? "bg-amber-50 border-amber-200 text-amber-700" : 
            isOverdue ? "bg-red-50 border-red-200 text-red-700" :
            "bg-muted/30 border-transparent text-muted-foreground"
          )}>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-tight">
              {isNearDue && <AlertCircle className="w-3 h-3 animate-pulse" />}
              Vence Dia
            </div>
            <div className="text-sm font-black">
              {bill.dueDay}
            </div>
          </div>
        </div>

        {bill.notes && (
          <div className="mt-4 pt-4 border-t border-dashed text-xs text-muted-foreground italic line-clamp-1">
             "{bill.notes}"
          </div>
        )}
      </CardContent>
    </Card>
  );
}
