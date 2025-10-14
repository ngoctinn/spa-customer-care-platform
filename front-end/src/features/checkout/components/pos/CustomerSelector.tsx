// src/features/checkout/components/pos/CustomerSelector.tsx
"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChevronsUpDown,
  UserPlus,
  Check,
  User,
  X,
  PlusCircle,
} from "lucide-react";
import { useCustomers } from "@/features/customer/hooks/useCustomers";
import { usePosStore } from "@/features/checkout/stores/pos-store";
import { cn } from "@/lib/utils";
import { FormDialog } from "@/components/common/FormDialog";
import { useCustomerManagement } from "@/features/customer/hooks/useCustomerManagement";
import CustomerFormFields from "@/features/customer/components/CustomerFormFields";
import { CustomerFormValues } from "@/features/customer/hooks/useCustomerManagement";

export function CustomerSelector() {
  const [open, setOpen] = useState(false);
  const { customer, setCustomer } = usePosStore();
  const { data: customers = [], isLoading } = useCustomers();

  const {
    form,
    isFormOpen,
    isSubmitting,
    handleOpenAddForm,
    handleCloseForm,
    handleFormSubmit,
  } = useCustomerManagement();

  const handleSelect = (selectedCustomer: (typeof customers)[0]) => {
    setCustomer(selectedCustomer);
    setOpen(false);
  };

  if (customer) {
    return (
      <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={customer.avatar_url || ""} />
            <AvatarFallback>{customer.full_name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{customer.full_name}</p>
            <p className="text-sm text-muted-foreground">
              {customer.phone_number}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setCustomer(null)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={isLoading}
          >
            {isLoading ? "Đang tải..." : "Chọn khách hàng..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder="Tìm khách hàng..." />
            <CommandList>
              <CommandEmpty>Không tìm thấy khách hàng.</CommandEmpty>
              <CommandGroup>
                {customers.map((c) => (
                  <CommandItem key={c.id} onSelect={() => handleSelect(c)}>
                    <Check className={cn("mr-2 h-4 w-4 opacity-0")} />
                    {c.full_name} ({c.phone_number})
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Button
        variant="outline"
        className="shrink-0"
        onClick={handleOpenAddForm}
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Khách mới
      </Button>

      <FormDialog<CustomerFormValues>
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title="Thêm khách hàng mới"
        form={form}
        onFormSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      >
        <CustomerFormFields />
      </FormDialog>
    </div>
  );
}
