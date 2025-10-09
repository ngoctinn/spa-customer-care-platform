// src/app/(admin)/dashboard/products/page.tsx (Refactored)
"use client";

import { useMemo } from "react";
import { PlusCircle } from "lucide-react";
import { getProductColumns } from "@/features/product/components/columns";
import { useProductManagement } from "@/features/product/hooks/useProductManagement"; // <- Import hook

import { DataTable } from "@/components/common/data-table/data-table";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/common/FormDialog";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { FullPageLoader } from "@/components/ui/spinner";
import ProductFormFields from "@/features/product/components/ProductForm";
import StockAdjustmentForm from "@/features/inventory/components/StockAdjustmentForm";

export default function ProductsDashboardPage() {
  const {
    isLoading,
    products,
    productForm,
    stockForm,
    isProductFormOpen,
    editingProduct,
    isStockFormOpen,
    productToAdjust,
    productToDelete,
    isSubmitting,
    isAdjustingStock,
    handleOpenAddProductForm,
    handleOpenEditProductForm,
    handleCloseProductForm,
    handleProductFormSubmit,
    handleOpenAdjustStockForm,
    handleCloseStockForm,
    handleStockFormSubmit,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleConfirmDelete,
  } = useProductManagement();

  const columns = useMemo(
    () =>
      getProductColumns(
        handleOpenEditProductForm,
        handleOpenDeleteDialog,
        handleOpenAdjustStockForm
      ),
    [
      handleOpenEditProductForm,
      handleOpenDeleteDialog,
      handleOpenAdjustStockForm,
    ]
  );

  if (isLoading) {
    return <FullPageLoader text="Đang tải danh sách sản phẩm..." />;
  }

  return (
    <>
      <PageHeader
        title="Quản lý Sản phẩm"
        description="Thêm mới, chỉnh sửa và quản lý tất cả sản phẩm của spa."
        actionNode={
          <Button onClick={handleOpenAddProductForm}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm sản phẩm
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={products}
        toolbarProps={{
          searchColumnId: "name",
          searchPlaceholder: "Lọc theo tên sản phẩm...",
        }}
      />

      {/* Product Add/Edit Dialog */}
      <FormDialog
        isOpen={isProductFormOpen}
        onClose={handleCloseProductForm}
        title={editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
        description="Điền đầy đủ các thông tin cần thiết dưới đây."
        form={productForm}
        onFormSubmit={handleProductFormSubmit}
        isSubmitting={isSubmitting}
        submitText={editingProduct ? "Lưu thay đổi" : "Tạo mới"}
      >
        <ProductFormFields />
      </FormDialog>

      {/* Stock Adjustment Dialog */}
      <FormDialog
        isOpen={isStockFormOpen}
        onClose={handleCloseStockForm}
        title={`Điều chỉnh tồn kho - ${productToAdjust?.name}`}
        description="Nhập số lượng để thêm hoặc bớt khỏi kho hiện tại."
        form={stockForm}
        onFormSubmit={handleStockFormSubmit}
        isSubmitting={isAdjustingStock}
        submitText="Xác nhận"
      >
        <StockAdjustmentForm isProductLocked={true} />
      </FormDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationModal
        isOpen={!!productToDelete}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa sản phẩm"
        description={`Bạn có chắc chắn muốn xóa sản phẩm "${productToDelete?.name}" không?`}
        isDestructive
      />
    </>
  );
}
