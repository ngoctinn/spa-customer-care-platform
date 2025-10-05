// src/components/common/DataStateMessage.tsx
import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type DataStateVariant = "empty" | "error";

interface DataStateMessageProps extends HTMLAttributes<HTMLDivElement> {
  message: string;
  description?: string;
  variant?: DataStateVariant;
}

const variantStyles: Record<DataStateVariant, string> = {
  empty:
    "border border-dashed border-border/60 bg-muted/40 text-muted-foreground",
  error:
    "border border-destructive/40 bg-destructive/10 text-destructive",
};

const descriptionStyles: Record<DataStateVariant, string> = {
  empty: "text-muted-foreground",
  error: "text-destructive/80",
};

export function DataStateMessage({
  message,
  description,
  variant = "empty",
  className,
  ...props
}: DataStateMessageProps) {
  return (
    <div
      className={cn(
        "rounded-lg px-4 py-6 text-center",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      <p className="text-base font-semibold">{message}</p>
      {description ? (
        <p className={cn("mt-2 text-sm", descriptionStyles[variant])}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
