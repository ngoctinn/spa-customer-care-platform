"use client";

import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChevronsUpDown, Plus } from "lucide-react";
import { useState } from "react";
import { useCategories } from "@/features/category/hooks/useCategories";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addCategory } from "@/features/category/api/category.api";
import { toast } from "sonner";
import AddCategoryForm from "@/features/category/components/AddCategoryForm";
import { CategoryType } from "@/features/category/types";

interface CategorySelectorProps {
  name: string;
  label: string;
  categoryType: CategoryType;
}

export function CategorySelector({
  name,
  label,
  categoryType,
}: CategorySelectorProps) {
  const { control, getValues, setValue } = useFormContext();
  const { data: categories = [] } = useCategories(categoryType);
  const queryClient = useQueryClient();
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);

  const selectedCategoryIds = getValues(name) || [];
  const relevantCategories = categories;
  const addCategoryMutation = useMutation({
    mutationFn: addCategory,
    onSuccess: (newCategory) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(`Đã thêm danh mục "${newCategory.name}"!`);
      setValue(name, [...selectedCategoryIds, newCategory.id]);
      setIsAddCategoryOpen(false);
    },
    onError: (err) => toast.error(`Thêm thất bại: ${err.message}`),
  });

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between h-auto min-h-9"
                >
                  <div className="flex gap-1 flex-wrap">
                    {selectedCategoryIds.length > 0
                      ? relevantCategories
                          .filter((c) => selectedCategoryIds.includes(c.id))
                          .map((c) => (
                            <Badge key={c.id} variant="secondary">
                              {c.name}
                            </Badge>
                          ))
                      : "Chọn danh mục..."}
                  </div>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <div className="p-2 space-y-1">
                {relevantCategories.map((category) => (
                  <FormField
                    key={category.id}
                    control={control}
                    name={name}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(category.id)}
                            onCheckedChange={(checked) => {
                              const currentValues = field.value || [];
                              return checked
                                ? field.onChange([
                                    ...currentValues,
                                    category.id,
                                  ])
                                : field.onChange(
                                    currentValues.filter(
                                      (value: string) => value !== category.id
                                    )
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {category.name}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <Separator />
              <Dialog
                open={isAddCategoryOpen}
                onOpenChange={setIsAddCategoryOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start rounded-t-none"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Thêm danh mục mới
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tạo danh mục mới</DialogTitle>
                  </DialogHeader>
                  <AddCategoryForm
                    categoryType={categoryType}
                    onFormSubmit={(data) => addCategoryMutation.mutate(data)}
                    onClose={() => setIsAddCategoryOpen(false)}
                    isSubmitting={addCategoryMutation.isPending}
                  />
                </DialogContent>
              </Dialog>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
