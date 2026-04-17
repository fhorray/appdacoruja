"use client";

import { Eye, EyeOff, Plus, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TransactionFormModal } from "./transaction-form-sheet";
import { useAuth } from "@/hooks/use-auth";

interface DashboardHeaderProps {
  isPrivate: boolean;
  setIsPrivate: (val: boolean) => void;
  balance: number;
  income: number;
  expenses: number;
  formatCurrency: (val: number) => string;
}

export function DashboardHeader({
  isPrivate,
  setIsPrivate,
  balance,
  income,
  expenses,
  formatCurrency,
}: DashboardHeaderProps) {
  const { user } = useAuth();
  const userId = user?.id as string;

  return (
    <div className="relative w-full rounded-[2rem] bg-zinc-950 text-white p-6 shadow-xl mb-6 overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-zinc-400">
              <span className="text-sm font-medium">Saldo Atual</span>
              <button 
                onClick={() => setIsPrivate(!isPrivate)}
                className="hover:text-white transition-colors p-1"
              >
                {isPrivate ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              {formatCurrency(balance)}
            </h1>
          </div>

          <TransactionFormModal mode="create" userId={userId}>
            <Button size="icon" className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shrink-0 h-10 w-10">
              <Plus className="w-5 h-5" />
            </Button>
          </TransactionFormModal>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 bg-zinc-900/50 rounded-2xl p-3 border border-white/5">
            <div className="bg-emerald-500/20 p-2 rounded-full">
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-zinc-400 font-medium">Receitas</span>
              <span className="text-sm font-semibold text-zinc-100">{formatCurrency(income)}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-zinc-900/50 rounded-2xl p-3 border border-white/5">
            <div className="bg-red-500/20 p-2 rounded-full">
              <ArrowDownRight className="w-4 h-4 text-red-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-zinc-400 font-medium">Despesas</span>
              <span className="text-sm font-semibold text-zinc-100">{formatCurrency(expenses)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
