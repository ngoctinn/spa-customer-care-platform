"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/common/data-table/data-table";
import { getSlipColumns } from "@/features/inventory/components/warehouse-slips/columns";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { FullPageLoader } from "@/components/ui/spinner";
import { useWarehouseSlipManagement } from "@/features/inventory/hooks/useWarehouseSlipManagement";
import WarehouseSlipDetail from "@/features/inventory/components/warehouse-slips/WarehouseSlipDetail";

export default function SlipHistoryPage() {
  const {
    slips,
    isLoading,
    slipToDelete,
    slipToView,
    handleDeleteSlip,
    handleEditSlip,
    handleViewDetails,
    handleCloseDeleteDialog,
    handleCloseViewDialog,
    handleConfirmDelete,
  } = useWarehouseSlipManagement();

  const columns = useMemo(
    () => getSlipColumns(handleViewDetails, handleEditSlip, handleDeleteSlip),
    [handleViewDetails, handleEditSlip, handleDeleteSlip]
  );

  const typeFilterOptions = [
    { label: "Phiếu Nhập", value: "IMPORT" },
    { label: "Phiếu Xuất", value: "EXPORT" },
  ];

  if (isLoading) {
    return <FullPageLoader text="Đang tải lịch sử phiếu kho..." />;
  }

  return (
    <>
      <PageHeader
        title="Lịch sử Nhập/Xuất kho"
        actionNode={
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/dashboard/inventory/warehouse-slips/import">
                <PlusCircle className="mr-2 h-4 w-4" /> Tạo Phiếu Nhập
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/inventory/warehouse-slips/export">
                <PlusCircle className="mr-2 h-4 w-4" /> Tạo Phiếu Xuất
              </Link>
            </Button>
          </div>
        }
      />
      <DataTable
        columns={columns}
        data={slips}
        toolbarProps={{
          searchColumnId: "code",
          searchPlaceholder: "Tìm theo mã phiếu...",
          facetedFilters: [
            {
              columnId: "type",
              title: "Loại Phiếu",
              options: typeFilterOptions,
            },
          ],
        }}
      />
      <WarehouseSlipDetail
        slip={slipToView}
        isOpen={!!slipToView}
        onClose={handleCloseViewDialog}
      />

      <ConfirmationModal
        isOpen={!!slipToDelete}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title={`Xác nhận xóa phiếu "${slipToDelete?.code}"`}
        description="Hành động này sẽ khôi phục lại số lượng tồn kho của các sản phẩm trong phiếu. Bạn có chắc chắn?"
        isDestructive
      />
    </>
  );
}
