"use client";
import * as TabsPrimitive from "@radix-ui/react-tabs";

export function Tabs({ value, onValueChange, children }: { value?: string; onValueChange?: (v: string) => void; children: React.ReactNode }) {
  return (
    <TabsPrimitive.Root value={value} onValueChange={onValueChange} className="w-full">
      {children}
    </TabsPrimitive.Root>
  );
}

export function TabsList({ children }: { children: React.ReactNode }) {
  return <TabsPrimitive.List className="flex gap-2 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">{children}</TabsPrimitive.List>;
}

export function TabsTrigger({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <TabsPrimitive.Trigger
      value={value}
      className="rounded-lg px-3 py-1 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-zinc-900"
    >
      {children}
    </TabsPrimitive.Trigger>
  );
}

export function TabsContent({ value, children }: { value: string; children: React.ReactNode }) {
  return <TabsPrimitive.Content value={value} className="mt-3">{children}</TabsPrimitive.Content>;
}
