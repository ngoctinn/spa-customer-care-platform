// src/app/(admin)/dashboard/inventory/warehouse-slips/import/[slipId]/edit/page.tsx
"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { CreateWarehouseSlipForm } from "@/features/inventory/components/warehouse-slips/CreateWarehouseSlipForm";
import { ImportSlipFormValues } from "@/features/inventory/schemas/warehouse-slip.schema";
import {
  useWarehouseSlipById,
  useWarehouseSlipMutations,
} from "@/features/inventory/hooks/useWarehouseSlips";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getWarehouseSlipById } from "@/features/inventory/apis/warehouse-slip.api";
import { FullPageLoader } from "@/components/ui/spinner";

export default function EditImportSlipPage() {
  const router = useRouter();
  const params = useParams();
  const slipId = params.slipId as string;

  const { data: slip, isLoading } = useWarehouseSlipById(slipId);

  const { updateMutation } = useWarehouseSlipMutations();

  const handleSubmit = (data: ImportSlipFormValues) => {
    updateMutation.mutate(
      { id: slipId, slipData: { ...data, type: "IMPORT" } },
      {
        onSuccess: () => {
          router.push("/dashboard/inventory/warehouse-slips");
        },
      }
    );
  };

  if (isLoading) {
    return <FullPageLoader text="Đang tải dữ liệu phiếu kho..." />;
  }

  return (
    <>
      <PageHeader
        title={`Chỉnh sửa Phiếu Nhập Kho: ${slip?.code}`}
        description="Cập nhật lại thông tin phiếu nhập kho."
      />
      <CreateWarehouseSlipForm
        type="IMPORT"
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
        initialData={slip || undefined}
      />
    </>
  );
}
