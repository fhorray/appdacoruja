import * as React from "react"
import { cn } from "@/lib/utils"
import { type LucideIcon } from "lucide-react"

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action, className, ...props }: EmptyStateProps) {
  return (
    <div
      className={cn("flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed bg-transparent p-8 text-center animate-in fade-in-50", className)}
      {...props}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/5 mb-4">
        <Icon className="h-10 w-10 text-muted-foreground/70" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mb-8 mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
        {description}
      </p>
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  )
}
