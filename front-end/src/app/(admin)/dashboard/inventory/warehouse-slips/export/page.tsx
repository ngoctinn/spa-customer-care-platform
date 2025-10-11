// src/app/(admin)/dashboard/inventory/warehouse-slips/export/page.tsx
"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { CreateWarehouseSlipForm } from "@/features/inventory/components/warehouse-slips/CreateWarehouseSlipForm";
import { ExportSlipFormValues } from "@/features/inventory/schemas/warehouse-slip.schema";
import { useWarehouseSlipMutations } from "@/features/inventory/hooks/useWarehouseSlips";
import { useRouter } from "next/navigation"; // ++ IMPORT ROUTER ++

export default function CreateExportSlipPage() {
  const router = useRouter(); // ++ KHỞI TẠO ROUTER ++
  const { createMutation } = useWarehouseSlipMutations(); // ++ SỬ DỤNG MUTATION ++

  const handleSubmit = (data: ExportSlipFormValues) => {
    // ++ GỌI API ĐỂ TẠO PHIẾU ++
    createMutation.mutate(
      { ...data, type: "EXPORT" },
      {
        onSuccess: () => {
          // ++ CHUYỂN HƯỚNG KHI THÀNH CÔNG ++
          router.push("/dashboard/inventory/warehouse-slips");
        },
      }
    );
  };

  return (
    <>
      <PageHeader
        title="Tạo Phiếu Xuất Kho"
        description="Ghi nhận sản phẩm xuất cho mục đích nội bộ."
      />
      <CreateWarehouseSlipForm type="EXPORT" onSubmit={handleSubmit} />
    </>
  );
}
