// src/features/category/components/AddCategoryForm.tsx
"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  CategoryFormValues,
  categoryFormSchema,
} from "@/features/category/schemas";
import CategoryFormFields from "@/features/category/components/CategoryFormFields";

interface AddCategoryFormProps {
  categoryType: "service" | "product" | "treatment";
  onFormSubmit: (data: CategoryFormValues) => void;
  onClose: () => void;
  isSubmitting?: boolean;
}

export default function AddCategoryForm({
  categoryType,
  onFormSubmit,
  onClose,
  isSubmitting,
}: AddCategoryFormProps) {
  // ✅ Form này có useForm và FormProvider riêng, hoàn toàn độc lập
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      type: categoryType,
    },
  });

  // Đảm bảo `type` của danh mục luôn đúng với ngữ cảnh
  useEffect(() => {
    form.setValue("type", categoryType);
  }, [categoryType, form]);

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onFormSubmit)}
        className="space-y-4 pt-4"
      >
        {/* Sử dụng lại các trường UI và ẩn đi trường "Loại" */}
        <CategoryFormFields hideTypeField={true} />

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Đang tạo..." : "Tạo mới"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
