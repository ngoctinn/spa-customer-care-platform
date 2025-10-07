"use client";

import { MultiImageUploader } from "@/components/common/MultiImageUploader";
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
import { useServices } from "@/features/service/hooks/useServices";
import { TreatmentPlanFormValues } from "@/features/treatment/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronsUpDown, Plus, PlusCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { toast } from "sonner";
// highlight-start
import PriceInput from "@/components/common/PriceInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TreatmentPlanFormFields() {
  const queryClient = useQueryClient();
  const form = useFormContext<TreatmentPlanFormValues>();

  const { control, watch, setValue, formState } =
    useFormContext<TreatmentPlanFormValues>();
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "steps",
  });

  const { data: categories = [] } = useCategories();
  const { data: services = [] } = useServices();
  const treatmentCategories = categories.filter(
    (c) => c.category_type === "treatment"
  );
  const selectedCategoryIds = form.watch("categories") || [];

  const addCategoryMutation = useMutation({
    mutationFn: addCategory,
    onSuccess: (newCategory) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(`Đã thêm danh mục "${newCategory.name}"!`);
      const currentCategories = watch("categories") || [];
      setValue("categories", [...currentCategories, newCategory.name]);
      setIsAddCategoryOpen(false);
    },
    onError: (err) => toast.error(`Thêm thất bại: ${err.message}`),
  });

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
      <FormField
        control={control}
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
                            const category = treatmentCategories.find(
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
                  {treatmentCategories.map((category) => (
                    <FormField
                      key={category.id}
                      control={control}
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
                      <DialogTitle>Tạo danh mục liệu trình mới</DialogTitle>
                    </DialogHeader>
                    <AddCategoryForm
                      categoryType="treatment"
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
