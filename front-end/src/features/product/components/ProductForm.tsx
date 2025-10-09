// src/features/product/components/EditProductForm.tsx
"use client";

import PriceInput from "@/components/common/PriceInput";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "react-hook-form";
import { ProductFormValues } from "../schemas";
import { CategorySelector } from "@/components/common/CategorySelector";
import { ImageSelectionInput } from "@/features/media/components/ImageSelectionInput";

export default function ProductFormFields() {
  const form = useFormContext<ProductFormValues>();

  const isRetail = form.watch("isRetail");

  const isConsumable = form.watch("isConsumable");
  const baseUnit = form.watch("baseUnit");

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
      <CategorySelector
        name="categories"
        label="Danh mục"
        categoryType="product"
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
        {isConsumable && (
          <FormField
            control={form.control}
            name="consumableUnit"
            render={({ field }) => (
              // Không còn style inline, component sẽ giữ nguyên layout gốc
              <FormItem>
                <FormLabel>Đơn vị Tiêu hao</FormLabel>
                <FormControl>
                  <Input placeholder="vd: ml, g, lần nhấn" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {isConsumable && (
          <FormField
            control={form.control}
            name="conversionRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tỷ lệ (1 {baseUnit || "DV cơ sở"} = ?)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="vd: 500"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value, 10))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isRetail && (
          <FormField
            control={form.control}
            name="price"
            // SỬA 1: Nhận vào { field }
            render={({ field }) => (
              <FormItem>
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
        )}
      </div>

      <FormField
        name="images"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Hình ảnh sản phẩm</FormLabel>
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
    </>
  );
}
