import * as React from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, description, actions, className, ...props }: PageHeaderProps) {
  return (
    <div 
      className={cn("flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6", className)} 
      {...props}
    >
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && (
          <p className="text-base text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex w-full sm:w-auto items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  )
}
