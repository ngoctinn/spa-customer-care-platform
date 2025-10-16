// src/components/ui/input.tsx
import { cn } from "@/lib/utils";
import * as React from "react";
import { AlertCircle } from "lucide-react"; // Import icon

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  onIconClick?: () => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, onIconClick, ...props }, ref) => {
    const isInvalid = props["aria-invalid"];
    const finalIcon = isInvalid ? (
      <AlertCircle className="h-4 w-4 text-destructive" />
    ) : (
      icon
    );

    return (
      <div className="relative">
        <input
          type={type}
          className={cn(
            "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            finalIcon ? "pr-10" : "",
            className
          )}
          ref={ref}
          {...props}
        />
        {finalIcon && (
          <div
            className={cn(
              "absolute inset-y-0 right-0 flex items-center pr-3",
              onIconClick && "cursor-pointer",
              isInvalid && "animate-shake"
            )}
            onClick={onIconClick}
          >
            {finalIcon}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
