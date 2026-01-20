"use client";
import * as SwitchPrimitive from "@radix-ui/react-switch";

export function Switch({ checked, onCheckedChange }: { checked?: boolean; onCheckedChange?: (c: boolean) => void }) {
  return (
    <SwitchPrimitive.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      className="inline-flex h-6 w-11 items-center rounded-full bg-zinc-800 p-1 transition data-[state=checked]:bg-zinc-100"
    >
      <SwitchPrimitive.Thumb className="block h-4 w-4 rounded-full bg-black transition translate-x-0 data-[state=checked]:translate-x-5" />
    </SwitchPrimitive.Root>
  );
}
