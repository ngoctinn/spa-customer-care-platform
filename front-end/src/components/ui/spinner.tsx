// src/components/ui/spinner.tsx
import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";

interface SpinnerProps {
  className?: string;
}

export const Spinner = ({ className }: SpinnerProps) => {
  return <Loader className={cn("animate-spin text-primary", className)} />;
};

interface FullPageLoaderProps {
  text?: string;
}

export const FullPageLoader = ({
  text = "Đang tải dữ liệu...",
}: FullPageLoaderProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-4">
      <Spinner className="w-8 h-8" />
      {text && <p className="text-muted-foreground">{text}</p>}
    </div>
  );
};
