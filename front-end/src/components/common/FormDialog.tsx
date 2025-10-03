"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  useForm,
  FormProvider,
  FieldValues, // Import FieldValues
  SubmitHandler,
} from "react-hook-form";
import React from "react";

interface FormDialogProps<TFormValues extends FieldValues> {
  // Thêm ràng buộc extends FieldValues
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  form: ReturnType<typeof useForm<TFormValues>>;
  onFormSubmit: (data: TFormValues) => void;
  isSubmitting?: boolean;
  children: React.ReactNode;
  submitText?: string;
}

export function FormDialog<TFormValues extends FieldValues>({
  // Thêm ràng buộc ở đây nữa
  isOpen,
  onClose,
  title,
  description,
  form,
  onFormSubmit,
  isSubmitting,
  children,
  submitText = "Lưu thay đổi",
}: FormDialogProps<TFormValues>) {
  // Định nghĩa lại kiểu cho hàm handleSubmit để TypeScript hiểu đúng
  const handleSubmit: SubmitHandler<TFormValues> = (data) => {
    onFormSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1 -m-1">
              {children}
            </div>
            <div className="flex justify-end gap-2 pt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang lưu..." : submitText}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
