import { Card, CardContent } from "./Card";

export function StatCard({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <Card className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-950 dark:to-zinc-900">
      <CardContent>
        <div className="text-xs text-zinc-500 dark:text-zinc-400">{title}</div>
        <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
        {hint && <div className="mt-2 text-xs text-zinc-500">{hint}</div>}
      </CardContent>
    </Card>
  );
}

