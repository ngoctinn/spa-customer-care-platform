"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { TreatmentPlanFormValues } from "@/features/treatment/schemas";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChevronsUpDown, Plus, PlusCircle, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { useEffect, useState } from "react";
import { addCategory } from "@/features/category/api/category.api";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MultiImageUploader } from "@/components/common/MultiImageUploader";
import { useServices } from "@/features/service/hooks/useServices";
import { useCategories } from "@/features/category/hooks/useCategories";
import AddCategoryForm from "@/features/category/components/AddCategoryForm";
// highlight-start
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { v4 as uuidv4 } from "uuid";
import { ImageUrl } from "@/features/shared/types";
// highlight-end

export default function TreatmentPlanFormFields() {
  const queryClient = useQueryClient();
  const form = useFormContext<TreatmentPlanFormValues>();

  const { control, watch, setValue, formState } =
    useFormContext<TreatmentPlanFormValues>();
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [displayPrice, setDisplayPrice] = useState(() =>
    control._getWatch("price")
      ? new Intl.NumberFormat("vi-VN").format(control._getWatch("price"))
      : ""
  );

  const { fields, append, remove } = useFieldArray({
    control,
    name: "steps",
  });

  const { data: categories = [] } = useCategories();
  const { data: services = [] } = useServices();
  const treatmentCategories = categories.filter((c) => c.type === "treatment");
  const selectedCategoryIds = form.watch("categories") || [];

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
                  {treatmentCategories.map((category) => (
                    <FormField
                      key={category.id}
                      control={control}
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
          render={() => (
            <FormItem>
              <FormLabel>Giá liệu trình</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    value={displayPrice}
                    onChange={handlePriceChange}
                    className="pr-12"
                  />
                </FormControl>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-muted-foreground">VND</span>
                </div>
              </div>
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

      {/* Field cho các Ảnh phụ */}
      <FormField
        name="images"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Hình ảnh liệu trình (Tùy chọn)</FormLabel>
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
    </>
  );
}
