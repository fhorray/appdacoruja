import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: "positive" | "negative" | "neutral"
  trendValue?: string
  description?: string
  className?: string
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue, 
  description,
  className 
}: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden transition-all border-border/50 shadow-sm hover:shadow-md rounded-2xl", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground/80">
          {title}
        </CardTitle>
        <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight text-foreground">{value}</div>
        
        {(trendValue || description) && (
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            {trend && trendValue && (
              <Badge 
                variant={trend === "positive" ? "default" : trend === "negative" ? "destructive" : "secondary"}
                className={cn(
                  "font-normal px-1.5 py-0.5 h-auto",
                  trend === "positive" ? "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25" : "",
                  trend === "negative" ? "bg-red-500/15 text-red-700 hover:bg-red-500/25" : ""
                )}
              >
                {trend === "positive" ? "+" : ""}{trendValue}
              </Badge>
            )}
            {description && <span>{description}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
