"use client";

import { MultiImageUploader } from "@/components/common/MultiImageUploader";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useServices } from "@/features/service/hooks/useServices";
import { TreatmentPlanFormValues } from "@/features/treatment/schemas";
import { PlusCircle, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import PriceInput from "@/components/common/PriceInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategorySelector } from "@/components/common/CategorySelector";

export default function TreatmentPlanFormFields() {
  const form = useFormContext<TreatmentPlanFormValues>();

  const { control, formState } = useFormContext<TreatmentPlanFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "steps",
  });

  const { data: services = [] } = useServices();

  return (
    <>
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tên liệu trình</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
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
        categoryType="treatment"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="price"
          render={(
            { field } // Nhận vào { field }
          ) => (
            <FormItem>
              <FormLabel>Giá liệu trình</FormLabel>
              <FormControl>
                {/* Thay thế bằng PriceInput */}
                <PriceInput name={field.name} label="Giá liệu trình" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div>
        <FormLabel>Các buổi trong liệu trình</FormLabel>
        <div className="space-y-4 mt-2">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex items-end gap-4 p-4 border rounded-md"
            >
              <div className="font-medium text-sm text-muted-foreground pt-8">
                Buổi {index + 1}
              </div>
              <FormField
                control={control}
                name={`steps.${index}.serviceId`}
                render={({ field: stepField }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Dịch vụ thực hiện</FormLabel>
                    <Select
                      onValueChange={stepField.onChange}
                      defaultValue={stepField.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn một dịch vụ..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => append({ serviceId: "" })} // Thay đổi ở đây
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm buổi
          </Button>
        </div>
        <FormMessage>
          {formState.errors.steps?.root?.message ||
            formState.errors.steps?.message}
        </FormMessage>
      </div>

      <FormField
        name="images"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Hình ảnh liệu trình (Tùy chọn)</FormLabel>
            <FormControl>
              <MultiImageUploader
                value={field.value || []}
                onFilesSelect={(files: File[]) => {
                  // === FIX CONFLICT: Giữ lại phiên bản này ===
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
