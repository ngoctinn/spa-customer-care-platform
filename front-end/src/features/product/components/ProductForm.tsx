// src/features/product/components/EditProductForm.tsx
"use client";

import { MultiImageUploader } from "@/components/common/MultiImageUploader";
import PriceInput from "@/components/common/PriceInput";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { addCategory } from "@/features/category/api/category.api";
import AddCategoryForm from "@/features/category/components/AddCategoryForm";
import { useCategories } from "@/features/category/hooks/useCategories";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronsUpDown, Plus } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { ProductFormValues } from "../schemas";

export default function ProductFormFields() {
  const form = useFormContext<ProductFormValues>();

  const isRetail = form.watch("isRetail");
  const { data: categories = [] } = useCategories();
  const productCategories = categories.filter((c) => c.type === "product");
  const selectedCategoryIds = form.watch("categories") || [];
  const isConsumable = form.watch("isConsumable");
  const baseUnit = form.watch("baseUnit");

  const queryClient = useQueryClient();

  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);

  const addCategoryMutation = useMutation({
    mutationFn: addCategory,
    onSuccess: (newCategory) => {
      queryClient.invalidateQueries({ queryKey: ["categories", "product"] });
      toast.success(`Đã thêm danh mục "${newCategory.name}"!`);
      const currentCategories = form.getValues("categories") || [];
      // Logic đã đúng khi dùng ID
      form.setValue("categories", [...currentCategories, newCategory.id]);
      setIsAddCategoryOpen(false);
    },
    onError: (err) => toast.error(`Thêm thất bại: ${err.message}`),
  });

  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tên sản phẩm</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Mô tả</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="categories"
        render={() => (
          <FormItem>
            <FormLabel>Danh mục</FormLabel>
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
                        ? selectedCategoryIds.map((id) => {
                            // Tìm đối tượng category đầy đủ từ ID
                            const category = productCategories.find(
                              (c) => c.id === id
                            );
                            return (
                              <Badge key={id} variant="secondary">
                                {/* Hiển thị tên */}
                                {category ? category.name : "Loading..."}
                              </Badge>
                            );
                          })
                        : "Chọn danh mục..."}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <div className="p-2 space-y-1">
                  {productCategories.map((category) => (
                    <FormField
                      key={category.id}
                      control={form.control}
                      name="categories"
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
                                        (value) => value !== category.id
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
                      <Plus className="mr-2 h-4 w-4" />
                      Thêm danh mục mới
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Tạo danh mục sản phẩm mới</DialogTitle>
                    </DialogHeader>
                    <AddCategoryForm
                      categoryType="product"
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
      <div className="space-y-2">
        <FormLabel>Mục đích sử dụng</FormLabel>
        <div className="flex items-center gap-8 pt-2">
          <FormField
            control={form.control}
            name="isRetail"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal">Sản phẩm bán lẻ</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isConsumable"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal">
                  Sản phẩm tiêu hao nội bộ
                </FormLabel>
              </FormItem>
            )}
          />
        </div>
        <FormMessage>{form.formState.errors.isRetail?.message}</FormMessage>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormField
          control={form.control}
          name="baseUnit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Đơn vị Cơ sở</FormLabel>
              <FormControl>
                <Input placeholder="vd: chai, hũ, tuýp" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="consumableUnit"
          render={({ field }) => (
            <FormItem style={{ display: isConsumable ? "block" : "none" }}>
              <FormLabel>Đơn vị Tiêu hao</FormLabel>
              <FormControl>
                <Input placeholder="vd: ml, g, lần nhấn" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="conversionRate"
          render={({ field }) => (
            <FormItem style={{ display: isConsumable ? "block" : "none" }}>
              <FormLabel>Tỷ lệ (1 {baseUnit || "DV cơ sở"} = ?)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="vd: 500"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="price"
          // SỬA 1: Nhận vào { field }
          render={({ field }) => (
            <FormItem style={{ display: isRetail ? "block" : "none" }}>
              <FormLabel>Giá bán</FormLabel>
              {/* SỬA 2: Đặt PriceInput trực tiếp trong FormControl */}
              <FormControl>
                {/* SỬA 3: Truyền `field.name` để kết nối với form state */}
                <PriceInput name={field.name} label="Giá bán" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="stock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tồn kho</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) =>
                    field.onChange(parseInt(e.target.value, 10) || 0)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        name="images"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Hình ảnh sản phẩm (Tùy chọn)</FormLabel>
            <FormControl>
              <MultiImageUploader
                value={field.value || []}
                onFilesSelect={(files: File[]) => {
                  // This is the correct logic to keep
                  field.onChange([...(field.value || []), ...files]);
                }}
                onRemoveImage={(imageToRemove) => {
                  const updatedImages = (field.value || []).filter(
                    (img) => img !== imageToRemove
                  );
                  field.onChange(updatedImages);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
