// src/app/(admin)/dashboard/resources/beds/page.tsx
"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ResourcePageLayout } from "@/features/management-pages/ResourcePageLayout";
import { Bed } from "@/features/resources/types";
import { BedFormValues } from "@/features/resources/schemas/bed.schema";
import { useBedManagement } from "@/features/resources/hooks/useBedManagement";
import { useRooms } from "@/features/resources/hooks/useResources";
import BedForm from "@/features/resources/components/BedForm";

export default function BedsPage() {
  const { data: rooms = [] } = useRooms();

  // Tạo một map để tra cứu tên phòng từ room_id
  const roomNameMap = React.useMemo(() => {
    return new Map(rooms.map((room) => [room.id, room.name]));
  }, [rooms]);

  const columns: ColumnDef<Bed>[] = [
    {
      accessorKey: "name",
      header: "Tên / Mã giường",
    },
    {
      accessorKey: "room_id",
      header: "Thuộc phòng",
      cell: ({ row }) =>
        roomNameMap.get(row.original.room_id) || "Không xác định",
    },
  ];

  return (
    <ResourcePageLayout<Bed, BedFormValues>
      title="Quản lý Giường"
      description="Thêm, sửa và quản lý các giường trong từng phòng."
      entityName="giường"
      columns={columns}
      useManagementHook={useBedManagement}
      FormComponent={BedForm}
      toolbarProps={{
        searchColumnId: "name",
        searchPlaceholder: "Tìm theo tên giường...",
      }}
    />
  );
}
