// src/features/booking/components/BookingProgressBar.tsx
"use client";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  name: string;
}

interface BookingProgressBarProps {
  steps: Step[];
  currentStep: number;
}

export function BookingProgressBar({
  steps,
  currentStep,
}: BookingProgressBarProps) {
  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="w-full mb-8">
      <div className="flex justify-between mb-2">
        {steps.map((step) => (
          <div
            key={step.id}
            className={cn(
              "text-sm text-center flex-1",
              step.id < currentStep
                ? "font-bold text-primary"
                : step.id === currentStep
                ? "font-bold text-foreground"
                : "text-muted-foreground"
            )}
          >
            {step.name}
          </div>
        ))}
      </div>
      <Progress value={progressPercentage} className="w-full h-2" />
    </div>
  );
}
