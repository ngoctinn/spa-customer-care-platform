// src/features/inventory/components/StockAdjustmentForm.tsx
"use client";

import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useProducts } from "@/features/product/hooks/useProducts";
import { useState } from "react";

interface StockAdjustmentFormProps {
  // Prop để khóa trường chọn sản phẩm khi điều chỉnh từ một dòng cụ thể
  isProductLocked?: boolean;
}

export default function StockAdjustmentForm({
  isProductLocked = false,
}: StockAdjustmentFormProps) {
  const { control, watch } = useFormContext();
  const { data: products = [], isLoading } = useProducts();

  // State để quản lý loại giao dịch (nhập/xuất)
  const [adjustmentType, setAdjustmentType] = useState<"in" | "out">("in");

  // Lấy giá trị số lượng hiện tại để tính toán
  const quantityValue = watch("quantity");

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="productId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sản phẩm</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              disabled={isLoading || isProductLocked}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn sản phẩm để điều chỉnh..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} (Tồn: {product.stock})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormItem>
        <FormLabel>Loại giao dịch</FormLabel>
        <RadioGroup
          defaultValue="in"
          className="flex gap-4 pt-2"
          onValueChange={(value: "in" | "out") => setAdjustmentType(value)}
        >
          <FormItem className="flex items-center space-x-2">
            <RadioGroupItem value="in" id="in" />
            <FormLabel htmlFor="in">Nhập kho</FormLabel>
          </FormItem>
          <FormItem className="flex items-center space-x-2">
            <RadioGroupItem value="out" id="out" />
            <FormLabel htmlFor="out">Xuất kho nội bộ</FormLabel>
          </FormItem>
        </RadioGroup>
      </FormItem>

      <FormField
        control={control}
        name="quantity"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Số lượng</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Nhập số lượng..."
                {...field}
                // Chuyển đổi giá trị sang kiểu số
                onChange={(e) => {
                  const numValue = parseInt(e.target.value, 10) || 0;
                  // Tự động chuyển thành số âm nếu là xuất kho
                  field.onChange(
                    adjustmentType === "out"
                      ? -Math.abs(numValue)
                      : Math.abs(numValue)
                  );
                }}
                // Hiển thị số dương trên UI cho dễ nhập
                value={Math.abs(quantityValue) || ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ghi chú (Tùy chọn)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="VD: Nhập hàng từ NCC ABC, Xuất cho dịch vụ XYZ..."
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
