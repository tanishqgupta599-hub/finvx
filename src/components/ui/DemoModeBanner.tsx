"use client";

import { useAppStore } from "@/state/app-store";
import { AlertTriangle } from "lucide-react";

export function DemoModeBanner() {
  const { demoDataEnabled, hasUnsavedChanges } = useAppStore();

  if (hasUnsavedChanges) {
    return (
      <div className="bg-orange-500/10 border-b border-orange-500/20 px-4 py-2 text-sm text-orange-500 flex items-center justify-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        <span className="font-medium">Unsaved Changes:</span>
        <span>
          Backend sync failed. You are currently in offline mode. Changes are saved locally but will be lost on logout.
        </span>
      </div>
    );
  }

  if (!demoDataEnabled) return null;

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-sm text-amber-500 flex items-center justify-center gap-2">
      <AlertTriangle className="h-4 w-4" />
      <span className="font-medium">Demo Mode Active:</span>
      <span>
        Database connection failed. Your data will <strong>NOT</strong> be saved after you logout.
      </span>
    </div>
  );
}
