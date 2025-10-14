// src/features/checkout/components/pos/ItemSearch.tsx
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
import { useServices } from "@/features/service/hooks/useServices";
import { useProducts } from "@/features/product/hooks/useProducts";
import { useTreatmentPlans } from "@/features/treatment/hooks/useTreatmentPlans";
import { usePosStore } from "@/features/checkout/stores/pos-store";
import { Service } from "@/features/service/types";
import { Product } from "@/features/product/types";
import { TreatmentPlan } from "@/features/treatment/types";

type Item = (Service | Product | TreatmentPlan) & {
  itemType: "service" | "product" | "treatment";
};

export function ItemSearch() {
  const [open, setOpen] = React.useState(false);
  const { addItem } = usePosStore();

  const { data: services = [] } = useServices();
  const { data: products = [] } = useProducts();
  const { data: treatments = [] } = useTreatmentPlans();

  const allItems: Item[] = [
    ...services.map((s) => ({ ...s, itemType: "service" as const })),
    ...products.map((p) => ({ ...p, itemType: "product" as const })),
    ...treatments.map((t) => ({ ...t, itemType: "treatment" as const })),
  ];

  const handleSelect = (item: Item) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      type: item.itemType,
      // `imageUrl` không quá quan trọng ở POS
      imageUrl: (item as any).images?.[0]?.url || "/images/placeholder.png",
    });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          Thêm dịch vụ/sản phẩm...
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Tìm kiếm..." />
          <CommandList>
            <CommandEmpty>Không tìm thấy.</CommandEmpty>
            <CommandGroup>
              {allItems.map((item) => (
                <CommandItem
                  key={`${item.itemType}-${item.id}`}
                  onSelect={() => handleSelect(item)}
                  value={`${item.name} ${item.itemType}`}
                >
                  <Check className={"mr-2 h-4 w-4 opacity-0"} />
                  {item.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
