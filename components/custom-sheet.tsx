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
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const isMobile = useIsMobile();
  
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = setExternalOpen || setInternalOpen;
  const close = () => setOpen(false);

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        {children && <DrawerTrigger asChild>{children}</DrawerTrigger>}
        <DrawerContent className={className}>
          <DrawerHeader className="text-left">
            {title && <DrawerTitle>{title}</DrawerTitle>}
            {description && <DrawerDescription>{description}</DrawerDescription>}
          </DrawerHeader>
          <ScrollArea className="max-h-[70vh] px-4">
            {content && (
              <div className="grid gap-4 py-4">
                {typeof content === "function" ? content({ close }) : content}
              </div>
            )}
          </ScrollArea>
          {footer && (
            <DrawerFooter className="pt-2">
              {typeof footer === "function" ? footer({ close }) : footer}
            </DrawerFooter>
          )}
        </DrawerContent>
      </Drawer>
    );
  }

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