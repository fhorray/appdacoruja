"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CustomDialogProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  content?: React.ReactNode | ((props: { close: () => void }) => React.ReactNode);
  footer?: React.ReactNode | ((props: { close: () => void }) => React.ReactNode);
  className?: string;
}

export function CustomDialog({
  children,
  title,
  description,
  content,
  footer,
  className,
}: CustomDialogProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className={className}>
        <DialogHeader>
          {title && <DialogTitle>{title}</DialogTitle>}
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {content && (
          <div className="grid gap-4 py-4">
            {typeof content === "function" ? content({ close }) : content}
          </div>
        )}
        {footer && (
          <DialogFooter>
            {typeof footer === "function" ? footer({ close }) : footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}