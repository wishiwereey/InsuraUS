import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold [&_svg]:size-3.5",
  {
    variants: {
      tone: {
        neutral: "border-line bg-canvas text-ink-soft",
        savings: "border-savings/25 bg-savings-soft text-savings-strong",
        risk: "border-risk/25 bg-risk-soft text-risk-strong",
        warn: "border-warn/30 bg-warn-soft text-warn-strong",
        info: "border-info/25 bg-info-soft text-info",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
