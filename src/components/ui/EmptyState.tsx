import { Button } from "./Button";

type EmptyStateProps = {
  title: string;
  description?: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  action?: React.ReactNode;
  illustrationSrc?: string;
};

export function EmptyState({
  title,
  description,
  primaryActionLabel,
  onPrimaryAction,
  action,
  illustrationSrc = "/window.svg",
}: EmptyStateProps) {
  const showPrimaryAction = primaryActionLabel && onPrimaryAction;

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 p-8 text-center dark:border-zinc-800">
      <img
        src={illustrationSrc}
        alt=""
        aria-hidden="true"
        className="mb-4 h-14 w-14 opacity-70"
      />
      <div className="text-lg font-medium">{title}</div>
      {description && <div className="mt-2 max-w-sm text-sm text-zinc-500">{description}</div>}
      {showPrimaryAction && (
        <div className="mt-4">
          <Button size="sm" onClick={onPrimaryAction}>
            {primaryActionLabel}
          </Button>
        </div>
      )}
      {!showPrimaryAction && action && <div className="mt-4">{action}</div>}
    </div>
  );
}
