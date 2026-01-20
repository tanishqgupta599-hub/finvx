"use client";
import { Sheet } from "@/components/ui/Sheet";

export function QuickAddModal({
  title,
  open,
  onOpenChange,
  children,
}: {
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={title}>
      <div className="space-y-3">{children}</div>
    </Sheet>
  );
}

