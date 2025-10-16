// src/app/(admin)/dashboard/resources/equipment/page.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ResourcePageLayout } from "@/features/management-pages/ResourcePageLayout";
import { Equipment } from "@/features/resources/types";
import { EquipmentFormValues } from "@/features/resources/schemas/equipment.schema";
import { useEquipmentManagement } from "@/features/resources/hooks/useEquipmentManagement";
import EquipmentForm from "@/features/resources/components/EquipmentForm";
import { Badge } from "@/components/ui/badge";

const columns: ColumnDef<Equipment>[] = [
  {
    accessorKey: "name",
    header: "Tên thiết bị",
  },
  {
    accessorKey: "quantity",
    header: "Số lượng",
  },
  {
    accessorKey: "type",
    header: "Loại",
    cell: ({ row }) => (
      <Badge variant="outline">
        {row.original.type === "FIXED" ? "Cố định" : "Di động"}
      </Badge>
    ),
  },
];

export default function EquipmentPage() {
  return (
    <ResourcePageLayout<Equipment, EquipmentFormValues>
      title="Quản lý Thiết bị"
      description="Quản lý các máy móc, thiết bị di động và cố định của spa."
      entityName="thiết bị"
      columns={columns}
      useManagementHook={useEquipmentManagement}
      FormComponent={EquipmentForm}
      toolbarProps={{
        searchColumnId: "name",
        searchPlaceholder: "Tìm theo tên thiết bị...",
      }}
    />
  );
}
