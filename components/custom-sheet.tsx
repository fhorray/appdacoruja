"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface CustomSheetProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  content?: React.ReactNode | ((props: { close: () => void }) => React.ReactNode);
  footer?: React.ReactNode | ((props: { close: () => void }) => React.ReactNode);
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function CustomSheet({
  children,
  title,
  description,
  content,
  footer,
  side = "right",
  className,
  open: externalOpen,
  onOpenChange: setExternalOpen,
}: CustomSheetProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = setExternalOpen || setInternalOpen;
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {children && <SheetTrigger asChild>{children}</SheetTrigger>}
      <SheetContent side={side} className={className}>
        <SheetHeader>
          {title && <SheetTitle>{title}</SheetTitle>}
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        {content && (
          <div className="grid gap-4 py-4">
            {typeof content === "function" ? content({ close }) : content}
          </div>
        )}
        {footer && (
          <SheetFooter>
            {typeof footer === "function" ? footer({ close }) : footer}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}