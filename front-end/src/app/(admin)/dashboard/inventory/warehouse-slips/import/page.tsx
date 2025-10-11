// src/app/(admin)/dashboard/inventory/warehouse-slips/import/page.tsx
"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { CreateWarehouseSlipForm } from "@/features/inventory/components/warehouse-slips/CreateWarehouseSlipForm";
import { ImportSlipFormValues } from "@/features/inventory/schemas/warehouse-slip.schema";
import { useWarehouseSlipMutations } from "@/features/inventory/hooks/useWarehouseSlips"; // ++ IMPORT HOOK MỚI ++
import { useRouter } from "next/navigation"; // ++ IMPORT ROUTER ++

export default function CreateImportSlipPage() {
  const router = useRouter(); // ++ KHỞI TẠO ROUTER ++
  const { createMutation } = useWarehouseSlipMutations(); // ++ SỬ DỤNG MUTATION ++

  const handleSubmit = (data: ImportSlipFormValues) => {
    // ++ GỌI API ĐỂ TẠO PHIẾU ++
    createMutation.mutate(
      { ...data, type: "IMPORT" },
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
        title="Tạo Phiếu Nhập Kho"
        description="Ghi nhận sản phẩm nhập từ nhà cung cấp."
      />
      <CreateWarehouseSlipForm type="IMPORT" onSubmit={handleSubmit} />
    </>
  );
}
