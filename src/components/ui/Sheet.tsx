"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export function Sheet({ open, onOpenChange, title, children }: { open: boolean; onOpenChange: (o: boolean) => void; title?: string; children: React.ReactNode }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out" />
        <Dialog.Content
          className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border border-zinc-200 bg-white p-4 pb-8 shadow-xl outline-none data-[state=open]:animate-slide-up data-[state=closed]:animate-slide-down dark:border-zinc-800 dark:bg-zinc-950 md:inset-auto md:left-auto md:right-4 md:top-4 md:w-96 md:rounded-2xl md:pb-4"
          aria-modal="true"
        >
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-sm font-medium">{title}</Dialog.Title>
            <Dialog.Close
              className="rounded-xl p-2 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-500 dark:hover:bg-zinc-800"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>
          <div className="mt-3">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
