// src/features/inventory/components/warehouse-slips/ProductSelector.tsx
"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useProducts } from "@/features/product/hooks/useProducts";
import { Product } from "@/features/product/types";

interface ProductSelectorProps {
  onSelect: (product: Product) => void;
}

export function ProductSelector({ onSelect }: ProductSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const { data: products = [], isLoading } = useProducts();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {isLoading ? "Đang tải..." : "Chọn sản phẩm..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Tìm sản phẩm..." />
          <CommandEmpty>Không tìm thấy sản phẩm.</CommandEmpty>
          <CommandGroup>
            {products.map((product) => (
              <CommandItem
                key={product.id}
                value={product.name}
                onSelect={() => {
                  onSelect(product);
                  setOpen(false);
                }}
              >
                <Check
                  className={"mr-2 h-4 w-4 opacity-0"} // Can add logic to show check if selected
                />
                {product.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
