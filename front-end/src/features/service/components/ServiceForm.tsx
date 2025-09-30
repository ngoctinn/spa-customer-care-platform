"use client";

import { v4 as uuidv4 } from "uuid";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addCategory } from "@/features/category/api/category.api";
import AddCategoryForm from "@/features/category/components/AddCategoryForm";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { useFieldArray, useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MultiImageUploader } from "@/components/common/MultiImageUploader";
import { useEffect, useState } from "react";
import { ServiceFormValues } from "@/features/service/schemas";
import { useCategories } from "@/features/category/hooks/useCategories";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronsUpDown, Plus, PlusCircle, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useProducts } from "@/features/product/hooks/useProducts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUrl } from "@/features/shared/types";

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

  // Logic xử lý giá tiền
  const [displayPrice, setDisplayPrice] = useState(() =>
    form.getValues("price")
      ? new Intl.NumberFormat("vi-VN").format(form.getValues("price"))
      : ""
  );

  const { data: categories = [] } = useCategories();
  const serviceCategories = categories.filter((c) => c.type === "service");

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "price" && value.price !== undefined) {
        const currentNumericPrice = parseFloat(
          displayPrice.replace(/[^0-9]/g, "")
        );
        if (value.price !== currentNumericPrice) {
          setDisplayPrice(value.price.toLocaleString("vi-VN"));
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form, displayPrice]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, "");
    const numberValue = parseInt(rawValue, 10) || 0;
    form.setValue("price", numberValue, { shouldValidate: true });
    setDisplayPrice(numberValue.toLocaleString("vi-VN"));
  };

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
                        ? selectedCategoryIds.map((catName) => (
                            <Badge key={catName} variant="secondary">
                              {catName}
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
                  {serviceCategories.map((category) => (
                    <FormField
                      key={category.id}
                      control={form.control}
                      name="categories"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(category.name)}
                              onCheckedChange={(checked) => {
                                const currentValues = field.value || [];
                                return checked
                                  ? field.onChange([
                                      ...currentValues,
                                      category.name,
                                    ])
                                  : field.onChange(
                                      currentValues.filter(
                                        (value) => value !== category.name
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
          render={() => (
            <FormItem>
              <FormLabel>Giá dịch vụ</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    value={displayPrice}
                    onChange={handlePriceChange}
                    className="pr-12"
                  />
                </FormControl>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-muted-foreground"> VND</span>
                </div>
              </div>
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
                defaultValue={field.value}
                onFilesSelect={(files: File[]) => {
                  const newImageUrls: ImageUrl[] = files.map((file, index) => ({
                    id: uuidv4(),
                    url: URL.createObjectURL(file),
                    is_primary: (field.value?.length || 0) + index === 0,
                    alt_text: file.name,
                  }));
                  field.onChange([...(field.value || []), ...newImageUrls]);
                }}
                onRemoveImage={(imageToRemove) => {
                  const updatedImages = (field.value || []).filter(
                    (img) => img.id !== imageToRemove.id
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
