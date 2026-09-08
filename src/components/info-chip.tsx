import { cn } from "@/lib/utils";

const TONE_CLASSES = {
  blue: "bg-blue-50 text-blue-700",
  violet: "bg-violet-50 text-violet-700",
  emerald: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  rose: "bg-rose-50 text-rose-700",
} as const;

export type InfoChipTone = keyof typeof TONE_CLASSES;

export function InfoChip({
  label,
  value,
  tone = "blue",
  className,
}: {
  label: string;
  value: string;
  tone?: InfoChipTone;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-0.5 rounded-xl px-3 py-2",
        TONE_CLASSES[tone],
        className
      )}
    >
      <span className="text-[0.7rem] font-medium uppercase tracking-wide opacity-80">
        {label}
      </span>
      <span className="truncate text-sm font-bold leading-none" title={value}>
        {value}
      </span>
    </div>
  );
}
