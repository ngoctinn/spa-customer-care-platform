// src/components/shared/password-input.tsx
"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";

export type PasswordInputProps = React.InputHTMLAttributes<HTMLInputElement>;

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

    return (
      <Input
        type={showPassword ? "text" : "password"}
        className={className}
        ref={ref}
        {...props}
        icon={
          showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )
        }
        onIconClick={togglePasswordVisibility}
      />
    );
  }
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
