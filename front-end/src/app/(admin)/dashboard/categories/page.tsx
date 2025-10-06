"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { DataTable } from "@/components/common/data-table/data-table";
import { FormDialog } from "@/components/common/FormDialog";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { FullPageLoader } from "@/components/ui/spinner";
import { getCategoryColumns } from "@/features/category/components/columns";
import CategoryFormFields from "@/features/category/components/CategoryFormFields";
import {
  useCategories,
  useAddCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/features/category/hooks/useCategories";
import {
  CategoryFormValues,
  categoryFormSchema,
} from "@/features/category/schemas";
import { Category } from "@/features/category/types";

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();
  const addCategoryMutation = useAddCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      type: "service",
    },
  });

  const handleOpenAddForm = () => {
    setEditingCategory(null);
    form.reset({ name: "", type: "service" });
    setIsFormOpen(true);
  };

  const handleOpenEditForm = useCallback(
    (category: Category) => {
      setEditingCategory(category);
      form.reset({
        name: category.name,
        type: category.type || "service",
      });
      setIsFormOpen(true);
    },
    [form]
  );

  const handleOpenDeleteDialog = useCallback((category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      deleteCategoryMutation.mutate(categoryToDelete.id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setCategoryToDelete(null);
        },
      });
    }
  };

  const handleFormSubmit = (data: CategoryFormValues) => {
    if (editingCategory) {
      updateCategoryMutation.mutate(
        { categoryId: editingCategory.id, categoryData: data },
        {
          onSuccess: () => setIsFormOpen(false),
        }
      );
    } else {
      addCategoryMutation.mutate(data, {
        onSuccess: () => setIsFormOpen(false),
      });
    }
  };

  const columns = useMemo(
    () => getCategoryColumns(handleOpenEditForm, handleOpenDeleteDialog),
    [handleOpenEditForm, handleOpenDeleteDialog]
  );

  const typeFilterOptions = [
    { label: "Dịch vụ", value: "service" },
    { label: "Sản phẩm", value: "product" },
    { label: "Liệu trình", value: "treatment" },
  ];

  if (isLoading) {
    return <FullPageLoader text="Đang tải danh sách danh mục..." />;
  }

  return (
    <>
      <PageHeader
        title="Quản lý Danh mục"
        description="Tạo mới, chỉnh sửa và quản lý tất cả danh mục trong hệ thống."
        actionNode={
          <Button onClick={handleOpenAddForm}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm danh mục
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={categories}
        toolbarProps={{
          searchColumnId: "name",
          searchPlaceholder: "Tìm theo tên danh mục...",
          facetedFilters: [
            {
              columnId: "type",
              title: "Loại",
              options: typeFilterOptions,
            },
          ],
        }}
      />

      <FormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
        description="Điền thông tin và chọn loại cho danh mục."
        form={form}
        onFormSubmit={handleFormSubmit}
        isSubmitting={
          addCategoryMutation.isPending || updateCategoryMutation.isPending
        }
        submitText={editingCategory ? "Lưu thay đổi" : "Tạo mới"}
      >
        <CategoryFormFields />
      </FormDialog>

      <ConfirmationModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa danh mục"
        description={`Bạn có chắc chắn muốn xóa danh mục "${categoryToDelete?.name}" không?`}
        isDestructive
        confirmText="Vẫn xóa"
      />
    </>
  );
}
