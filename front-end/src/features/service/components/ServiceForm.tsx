"use client";

import { CategorySelector } from "@/features/category/components/CategorySelector";
import PriceInput from "@/components/common/PriceInput";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useProducts } from "@/features/product/hooks/useProducts";
import { ServiceFormValues } from "@/features/service/schemas";
import { PlusCircle, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { ImageSelectionInput } from "@/features/media/components/ImageSelectionInput";
import { Checkbox } from "@/components/ui/checkbox";

export default function ServiceForm() {
  const form = useFormContext<ServiceFormValues>();
  const { data: products = [] } = useProducts();

  const consumableProducts = products.filter((p) => p.is_consumable);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "consumables",
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
      <CategorySelector
        name="category_ids"
        label="Danh mục"
        categoryType="service"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Giá dịch vụ</FormLabel>
              <FormControl>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="required_staff"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Số lượng nhân viên</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  {...field}
                  value={field.value || 1}
                  onChange={(e) =>
                    field.onChange(parseInt(e.target.value, 10) || 1)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="requires_bed"
          render={({ field }) => (
            <FormItem className="flex flex-row items-end space-x-3 space-y-0 rounded-md border p-4 h-full">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Yêu cầu giường riêng</FormLabel>
              </div>
            </FormItem>
          )}
        />
      </div>

      <FormField
        name="images"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Hình ảnh dịch vụ</FormLabel>
            <FormControl>
              <ImageSelectionInput
                value={field.value || []}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {/* // Ví dụ cho chế độ chọn 1 ảnh
      <FormField
        name="featuredImage" // giả sử có một trường ảnh đại diện
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ảnh đại diện</FormLabel>
            <FormControl>
              <ImageSelectionInput
                // Chuyển đổi qua lại giữa mảng và object đơn
                value={field.value ? [field.value] : []}
                onChange={(images) => field.onChange(images[0] || null)}
                maxImages={1}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      /> */}
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
                className="flex items-center gap-4 p-4 border rounded-md"
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
