// src/app/(admin)/dashboard/inventory/warehouse-slips/export/[slipId]/edit/page.tsx
"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { CreateWarehouseSlipForm } from "@/features/inventory/components/warehouse-slips/CreateWarehouseSlipForm";
import { ExportSlipFormValues } from "@/features/inventory/schemas/warehouse-slip.schema";
import { useWarehouseSlipMutations } from "@/features/inventory/hooks/useWarehouseSlips";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getWarehouseSlipById } from "@/features/inventory/apis/warehouse-slip.api";
import { FullPageLoader } from "@/components/ui/spinner";

export default function EditExportSlipPage() {
  const router = useRouter();
  const params = useParams();
  const slipId = params.slipId as string;

  const { data: slip, isLoading } = useQuery({
    queryKey: ["warehouseSlips", slipId],
    queryFn: () => getWarehouseSlipById(slipId),
    enabled: !!slipId,
  });

  const { updateMutation } = useWarehouseSlipMutations();

  const handleSubmit = (data: ExportSlipFormValues) => {
    updateMutation.mutate(
      { id: slipId, slipData: { ...data, type: "EXPORT" } },
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
        title={`Chỉnh sửa Phiếu Xuất Kho: ${slip?.code}`}
        description="Cập nhật lại thông tin phiếu xuất kho."
      />
      <CreateWarehouseSlipForm
        type="EXPORT"
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
        initialData={slip}
      />
    </>
  );
}
