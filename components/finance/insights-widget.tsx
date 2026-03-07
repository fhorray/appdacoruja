"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, TrendingUp, TrendingDown, Info, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Insight {
    type: 'positive' | 'warning' | 'info';
    title: string;
    message: string;
}

interface InsightsWidgetProps {
    insights: Insight[];
}

export function InsightsWidget({ insights }: InsightsWidgetProps) {
    if (insights.length === 0) return null;

    return (
        <Card className="col-span-full shadow-sm border-primary/10 overflow-hidden group">
            <CardHeader className="bg-primary/5 pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    Insights Financeiros
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-primary/5">
                    {insights.map((insight, idx) => {
                        const Icon = insight.type === 'positive' ? CheckCircle2 :
                            insight.type === 'warning' ? AlertTriangle : Info;

                        return (
                            <div key={idx} className="p-5 flex gap-4 hover:bg-muted/30 transition-colors">
                                <div className={cn(
                                    "p-2 rounded-xl h-fit shrink-0",
                                    insight.type === 'positive' ? "bg-emerald-100 text-emerald-600" :
                                        insight.type === 'warning' ? "bg-amber-100 text-amber-600" :
                                            "bg-blue-100 text-blue-600"
                                )}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-sm text-foreground">{insight.title}</h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {insight.message}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
