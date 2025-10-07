// src/features/booking/components/BookingProgress.tsx
"use client";

import { cn } from "@/lib/utils";

interface Step {
  id: number;
  name: string;
}

interface BookingProgressProps {
  steps: Step[];
  currentStep: number;
}

export default function BookingProgress({
  steps,
  currentStep,
}: BookingProgressProps) {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
        {steps.map((step, index) => {
          const stepIndex = index + 1;
          const status =
            currentStep > stepIndex
              ? "complete"
              : currentStep === stepIndex
              ? "current"
              : "upcoming";

          return (
            <li key={step.name} className="md:flex-1">
              <div
                className={cn(
                  "group flex flex-col border-l-4 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4",
                  status === "complete" && "border-primary",
                  status === "current" && "border-primary",
                  status === "upcoming" &&
                    "border-border group-hover:border-muted-foreground"
                )}
              >
                <span
                  className={cn(
                    "text-sm font-medium transition-colors",
                    status === "complete" && "text-primary",
                    status === "current" && "text-primary",
                    status === "upcoming" && "text-muted-foreground"
                  )}
                >
                  Bước {step.id}
                </span>
                <span className="text-sm font-medium">{step.name}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
