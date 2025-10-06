// src/app/(admin)/dashboard/inventory/page.tsx
"use client";

import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/data-table/data-table";
import { FullPageLoader } from "@/components/ui/spinner";
import { FormDialog } from "@/components/common/FormDialog";
import { Product } from "@/features/product/types";
import { useProducts } from "@/features/product/hooks/useProducts";
import { useAdjustStock } from "@/features/inventory/hooks/useInventory";
import { getInventoryColumns } from "@/features/inventory/components/columns";
import {
  stockAdjustmentSchema,
  StockAdjustmentFormValues,
} from "@/features/product/schemas";
import StockAdjustmentForm from "@/features/inventory/components/StockAdjustmentForm";
import { StockHistoryDialog } from "@/features/inventory/components/StockHistoryDialog";

export default function InventoryPage() {
  // Hooks để lấy dữ liệu và thực hiện mutations
  const { data: products = [], isLoading } = useProducts();
  const adjustStockMutation = useAdjustStock();

  // State cho dialog điều chỉnh tồn kho
  const [isStockFormOpen, setIsStockFormOpen] = useState(false);
  const [productToAdjust, setProductToAdjust] = useState<Product | null>(null);

  // State cho dialog xem lịch sử
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [productHistory, setProductHistory] = useState<Product | null>(null);

  // Form cho việc điều chỉnh kho
  const stockForm = useForm<StockAdjustmentFormValues>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: { productId: "", quantity: 1, notes: "" },
  });

  // --- Handlers ---
  const handleOpenAdjustStockForm = useCallback(
    (product: Product) => {
      setProductToAdjust(product);
      stockForm.reset({
        productId: product.id,
        quantity: 1,
        notes: "",
      });
      setIsStockFormOpen(true);
    },
    [stockForm]
  );

  const handleOpenHistoryDialog = useCallback((product: Product) => {
    setProductHistory(product);
    setIsHistoryOpen(true);
  }, []);

  const handleStockFormSubmit = (data: StockAdjustmentFormValues) => {
    adjustStockMutation.mutate(data, {
      onSuccess: () => {
        setIsStockFormOpen(false);
      },
    });
  };

  const columns = useMemo(
    () =>
      getInventoryColumns(handleOpenAdjustStockForm, handleOpenHistoryDialog),
    [handleOpenAdjustStockForm, handleOpenHistoryDialog]
  );

  if (isLoading) {
    return <FullPageLoader text="Đang tải dữ liệu kho hàng..." />;
  }

  return (
    <>
      <PageHeader
        title="Quản lý Kho hàng"
        description="Theo dõi tồn kho, xem lịch sử nhập/xuất và quản lý sản phẩm."
      />

      <DataTable
        columns={columns}
        data={products}
        toolbarProps={{
          searchColumnId: "name",
          searchPlaceholder: "Tìm sản phẩm trong kho...",
        }}
      />

      {/* Dialog Điều chỉnh Tồn kho */}
      <FormDialog
        isOpen={isStockFormOpen}
        onClose={() => setIsStockFormOpen(false)}
        title={`Điều chỉnh tồn kho - ${productToAdjust?.name}`}
        description="Nhập số lượng để thêm (nhập kho) hoặc bớt (xuất kho) khỏi số lượng hiện tại."
        form={stockForm}
        onFormSubmit={handleStockFormSubmit}
        isSubmitting={adjustStockMutation.isPending}
        submitText="Xác nhận"
      >
        <StockAdjustmentForm isProductLocked={true} />
      </FormDialog>

      {/* Dialog Xem Lịch sử */}
      <StockHistoryDialog
        product={productHistory}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </>
  );
}
