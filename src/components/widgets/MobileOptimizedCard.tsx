"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface MobileOptimizedCardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  action?: ReactNode;
}

/**
 * Mobile-optimized card component with responsive padding and spacing
 */
export function MobileOptimizedCard({
  title,
  children,
  className,
  headerClassName,
  contentClassName,
  action
}: MobileOptimizedCardProps) {
  return (
    <Card className={cn("bg-zinc-900/50 border-white/10", className)}>
      {title && (
        <CardHeader className={cn("pb-3 px-4 md:px-6", headerClassName)}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-zinc-400">{title}</CardTitle>
            {action}
          </div>
        </CardHeader>
      )}
      <CardContent className={cn("px-4 md:px-6", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
