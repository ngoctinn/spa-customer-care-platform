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
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useProducts } from "@/features/product/hooks/useProducts";
import { Product } from "@/features/product/types";
import { cn } from "@/lib/utils";

interface ProductSelectorProps {
  onSelect: (product: Product) => void;
  isImport: boolean;
}

export function ProductSelector({ onSelect, isImport }: ProductSelectorProps) {
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
          {isLoading ? "Đang tải..." : "Thêm sản phẩm vào phiếu..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Tìm sản phẩm..." />
          <CommandList>
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
                  disabled={!isImport && product.stock <= 0}
                  className={cn(
                    !isImport &&
                      product.stock <= 0 &&
                      "text-muted-foreground italic"
                  )}
                >
                  <Check className={"mr-2 h-4 w-4 opacity-0"} />
                  <span>
                    {product.name}{" "}
                    <span className="text-muted-foreground">
                      (Tồn: {product.stock})
                    </span>
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
