import { getSuccessStepTitle } from "@/lib/success-steps-content";

type SuccessStepBadgeProps = {
  step: number;
  size?: "sm" | "md";
  className?: string;
};

const sizeClass = {
  sm: "h-5 w-5 text-[10px]",
  md: "h-7 w-7 text-xs",
} as const;

export function SuccessStepBadge({
  step,
  size = "sm",
  className = "",
}: SuccessStepBadgeProps) {
  const title = getSuccessStepTitle(step);

  return (
    <span
      title={title || undefined}
      aria-label={title ? `成功のステップ ${step}: ${title}` : `成功のステップ ${step}`}
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-zinc-800 font-bold text-white ${sizeClass[size]} ${className}`}
    >
      {step}
    </span>
  );
}
