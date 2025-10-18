// src/app/(admin)/dashboard/products/[productId]/inventory/page.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useProductById } from "@/features/product/hooks/useProducts";
import {
  stockAdjustmentSchema,
  StockAdjustmentFormValues,
} from "@/features/product/schemas";
import { useAdjustStock } from "@/features/inventory/hooks/useInventory";

import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FormDialog } from "@/components/common/FormDialog";
import StockAdjustmentForm from "@/features/inventory/components/StockAdjustmentForm";
import InventoryHistoryList from "@/features/inventory/components/InventoryHistoryList";
import { FullPageLoader } from "@/components/ui/spinner";
import { SlidersHorizontal } from "lucide-react";
import Link from "next/link";

// Định nghĩa Props cho trang
interface InventoryManagementPageProps {
  params: {
    productId: string;
  };
}

export default function InventoryManagementPage({
  params,
}: InventoryManagementPageProps) {
  const { productId } = params;

  // State quản lý việc mở/đóng dialog
  const [isStockFormOpen, setIsStockFormOpen] = useState(false);

  // Lấy dữ liệu sản phẩm chi tiết
  const { data: product, isLoading: isLoadingProduct } = useProductById(productId);

  // Khởi tạo mutation và form
  const adjustStockMutation = useAdjustStock();
  const stockForm = useForm<StockAdjustmentFormValues>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: {
      productId: productId,
      quantity: 1,
      notes: "",
    },
  });

  // Xử lý khi submit form
  const handleStockFormSubmit = (data: StockAdjustmentFormValues) => {
    adjustStockMutation.mutate(data, {
      onSuccess: () => {
        setIsStockFormOpen(false);
      },
    });
  };

  // Mở dialog và reset form
  const handleOpenAdjustStockForm = () => {
    stockForm.reset({
      productId: productId,
      quantity: 1,
      notes: "",
    });
    setIsStockFormOpen(true);
  };

  if (isLoadingProduct) {
    return <FullPageLoader text="Đang tải thông tin sản phẩm..." />;
  }

  if (!product) {
    return (
      <div>
        <PageHeader title="Không tìm thấy sản phẩm" />
        <Link href="/dashboard/products">
          <Button variant="outline">Quay lại danh sách</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={`Quản lý kho: ${product.name}`}
        description="Theo dõi lịch sử và điều chỉnh số lượng tồn kho của sản phẩm."
        actionNode={
          <Button onClick={handleOpenAdjustStockForm}>
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Điều chỉnh tồn kho
          </Button>
        }
      />

      {/* Thẻ hiển thị thông tin tồn kho hiện tại */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Thông tin hiện tại</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground">
              Tồn kho hiện tại:
            </span>
            <Badge variant="secondary" className="text-lg">
              {product.stock} {product.base_unit}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Component hiển thị lịch sử kho */}
      <InventoryHistoryList productId={productId} />

      {/* Dialog điều chỉnh tồn kho */}
      <FormDialog
        isOpen={isStockFormOpen}
        onClose={() => setIsStockFormOpen(false)}
        title={`Điều chỉnh tồn kho - ${product.name}`}
        description="Nhập số lượng để thêm hoặc bớt khỏi kho hiện tại."
        form={stockForm}
        onFormSubmit={handleStockFormSubmit}
        isSubmitting={adjustStockMutation.isPending}
        submitText="Xác nhận"
      >
        <StockAdjustmentForm isProductLocked={true} />
      </FormDialog>
    </>
  );
}
