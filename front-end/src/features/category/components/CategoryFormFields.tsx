"use client";

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
import { useFormContext } from "react-hook-form";

interface CategoryFormFieldsProps {
  // Prop để ẩn trường 'type' khi thêm nhanh từ form khác
  hideTypeField?: boolean;
}

// Đổi tên component để thể hiện rõ vai trò chỉ chứa các trường của form
export default function CategoryFormFields({
  hideTypeField = false,
}: CategoryFormFieldsProps) {
  const { control } = useFormContext();

  return (
    <>
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tên danh mục</FormLabel>
            <FormControl>
              <Input placeholder="VD: Chăm sóc da chuyên sâu" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {!hideTypeField && (
        <FormField
          control={control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loại danh mục</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại danh mục" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="service">Dịch vụ</SelectItem>
                  <SelectItem value="product">Sản phẩm</SelectItem>
                  <SelectItem value="treatment">Liệu trình</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
}
