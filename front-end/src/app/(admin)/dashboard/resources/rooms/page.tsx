// src/app/(admin)/dashboard/resources/rooms/page.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ResourcePageLayout } from "@/features/management-pages/ResourcePageLayout";
import { Room } from "@/features/resources/types";
import { RoomFormValues } from "@/features/resources/schemas/room.schema";
import { useRoomManagement } from "@/features/resources/hooks/useRoomManagement";
import RoomForm from "@/features/resources/components/RoomForm";

const columns: ColumnDef<Room>[] = [
  {
    accessorKey: "name",
    header: "Tên phòng",
  },
  {
    accessorKey: "description",
    header: "Mô tả",
    cell: ({ row }) => row.original.description || "Không có mô tả",
  },
];

export default function RoomsPage() {
  return (
    <ResourcePageLayout<Room, RoomFormValues>
      title="Quản lý Phòng"
      description="Tạo, chỉnh sửa và quản lý các phòng chức năng của spa."
      entityName="phòng"
      columns={columns}
      useManagementHook={useRoomManagement}
      FormComponent={RoomForm}
      toolbarProps={{
        searchColumnId: "name",
        searchPlaceholder: "Tìm theo tên phòng...",
      }}
    />
  );
}
