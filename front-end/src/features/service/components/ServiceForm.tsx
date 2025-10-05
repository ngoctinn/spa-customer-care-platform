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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { addCategory } from "@/features/category/api/category.api";
import AddCategoryForm from "@/features/category/components/AddCategoryForm";
import { useCategories } from "@/features/category/hooks/useCategories";
import { useProducts } from "@/features/product/hooks/useProducts";
import { ServiceFormValues } from "@/features/service/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronsUpDown, Plus, PlusCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { toast } from "sonner";

export default function ServiceForm() {
  const queryClient = useQueryClient();
  const form = useFormContext<ServiceFormValues>();
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const { data: products = [] } = useProducts();
  const selectedCategoryIds = form.watch("categories") || [];

  // Lọc ra các sản phẩm là hàng tiêu hao
  const consumableProducts = products.filter((p) => p.is_consumable);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "consumables",
  });

  const { data: categories = [] } = useCategories();
  const serviceCategories = categories.filter((c) => c.type === "service");

  const addCategoryMutation = useMutation({
    mutationFn: addCategory,
    onSuccess: (newCategory) => {
      queryClient.invalidateQueries({ queryKey: ["categories", "service"] });
      toast.success(`Đã thêm danh mục "${newCategory.name}"!`);
      const currentCategories = form.getValues("categories") || [];
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
            <FormLabel>Tên dịch vụ</FormLabel>
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
                            const category = serviceCategories.find(
                              (c) => c.id === id
                            );
                            return (
                              <Badge key={id} variant="secondary">
                                {/* Hiển thị tên, nếu không tìm thấy thì báo lỗi */}
                                {category ? category.name : "ID không hợp lệ"}
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
                  {serviceCategories.map((category) => (
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
                      <DialogTitle>Tạo danh mục dịch vụ mới</DialogTitle>
                    </DialogHeader>
                    <AddCategoryForm
                      categoryType="service"
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="price"
          render={(
            { field } // Nhận vào { field }
          ) => (
            <FormItem>
              <FormLabel>Giá dịch vụ</FormLabel>
              <FormControl>
                {/* Thay thế bằng PriceInput */}
                <PriceInput name={field.name} label="Giá dịch vụ" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="duration_minutes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thời lượng</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    type="number"
                    className="pr-14"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value, 10) || 0)
                    }
                  />
                </FormControl>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-muted-foreground">phút</span>
                </div>
              </div>
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
            <FormLabel>Hình ảnh dịch vụ (Tùy chọn)</FormLabel>
            <FormControl>
              <MultiImageUploader
                // `value` bây giờ sẽ là mảng (File | ImageUrl)[]
                value={field.value || []}
                onFilesSelect={(files: File[]) => {
                  // Thêm trực tiếp các đối tượng File mới vào state của form
                  field.onChange([...(field.value || []), ...files]);
                }}
                onRemoveImage={(imageToRemove) => {
                  // Lọc ra ảnh cần xóa dựa trên object reference hoặc id
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

      <FormField
        control={form.control}
        name="preparation_notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ghi chú chuẩn bị</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Hướng dẫn khách hàng chuẩn bị trước khi đến..."
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="aftercare_instructions"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Hướng dẫn sau chăm sóc</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Những điều cần làm sau khi sử dụng dịch vụ..."
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="contraindications"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Chống chỉ định</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Các trường hợp không nên sử dụng dịch vụ này..."
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div>
        <FormLabel>Sản phẩm tiêu hao cho dịch vụ</FormLabel>
        <div className="space-y-4 mt-2">
          {fields.map((field, index) => {
            const selectedProductId = form.watch(
              `consumables.${index}.productId`
            );
            const selectedProduct = consumableProducts.find(
              (p) => p.id === selectedProductId
            );
            return (
              <div
                key={field.id}
                className="flex items-start gap-4 p-4 border rounded-md"
              >
                <FormField
                  control={form.control}
                  name={`consumables.${index}.productId`}
                  render={({ field: consumableField }) => (
                    <FormItem className="flex-1">
                      <Select
                        onValueChange={consumableField.onChange}
                        defaultValue={consumableField.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn sản phẩm tiêu hao..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {consumableProducts.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`consumables.${index}.quantityUsed`}
                  render={({ field: quantityField }) => (
                    <FormItem>
                      <FormLabel>
                        Số lượng ({selectedProduct?.consumable_unit || "đơn vị"}
                        )
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Số lượng"
                          className="w-32"
                          {...quantityField}
                          onChange={(e) =>
                            quantityField.onChange(
                              parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  className="mt-8" // Căn chỉnh nút xóa
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            );
          })}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ productId: "", quantityUsed: 1 })}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm sản phẩm tiêu hao
          </Button>
        </div>
      </div>
    </>
  );
}
