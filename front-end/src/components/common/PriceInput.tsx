// src/components/shared/PriceInput.tsx
"use client";

import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { useEffect, useState } from "react";

interface PriceInputProps {
  name: string;
  label: string;
  placeholder?: string;
}

export default function PriceInput({ name, ...props }: PriceInputProps) {
  const { setValue, getValues, watch } = useFormContext();
  const [displayPrice, setDisplayPrice] = useState(() =>
    getValues(name)
      ? new Intl.NumberFormat("vi-VN").format(getValues(name))
      : ""
  );

  useEffect(() => {
    const subscription = watch((value, { name: fieldName }) => {
      if (fieldName === name && value[name] !== undefined) {
        const currentNumericPrice = parseFloat(
          displayPrice.replace(/[^0-9]/g, "")
        );
        if (value[name] !== currentNumericPrice) {
          setDisplayPrice(value[name].toLocaleString("vi-VN"));
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, name, displayPrice]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, "");
    const numberValue = parseInt(rawValue, 10) || 0;
    setValue(name, numberValue, { shouldValidate: true });
    setDisplayPrice(numberValue.toLocaleString("vi-VN"));
  };

  return (
    <div className="relative">
      <Input
        value={displayPrice}
        onChange={handlePriceChange}
        placeholder={props.placeholder || "0"}
        className="pr-12"
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <span className="text-muted-foreground">VND</span>
      </div>
    </div>
  );
}
