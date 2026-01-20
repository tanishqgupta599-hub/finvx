"use client";
import * as SwitchPrimitive from "@radix-ui/react-switch";

export function Switch({ checked, onCheckedChange }: { checked?: boolean; onCheckedChange?: (c: boolean) => void }) {
  return (
    <SwitchPrimitive.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      className="inline-flex h-6 w-11 items-center rounded-full bg-zinc-200 p-1 transition data-[state=checked]:bg-zinc-900 dark:bg-zinc-800 dark:data-[state=checked]:bg-zinc-100"
    >
      <SwitchPrimitive.Thumb className="block h-4 w-4 rounded-full bg-white transition translate-x-0 data-[state=checked]:translate-x-5 dark:bg-black" />
    </SwitchPrimitive.Root>
  );
}
