// src/app/(admin)/dashboard/inventory/stock-taking/page.tsx
"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import { FullPageLoader } from "@/components/ui/spinner";
import { PlusCircle } from "lucide-react";
import { StockTakeSession } from "@/features/inventory/types";
import {
  useStockTakes,
  useStockTakeMutations,
} from "@/features/inventory/hooks/useStockTakes";

const getColumns = (): ColumnDef<StockTakeSession>[] => [
  {
    accessorKey: "code",
    header: "Mã Phiên",
    cell: ({ row }) => (
      <Link
        href={`/dashboard/inventory/stock-taking/${row.original.id}`}
        className="font-medium text-primary hover:underline"
      >
        {row.original.code}
      </Link>
    ),
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const isOngoing = row.original.status === "ongoing";
      return (
        <Badge variant={isOngoing ? "secondary" : "default"}>
          {isOngoing ? "Đang tiến hành" : "Đã hoàn tất"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Ngày Tạo",
    cell: ({ row }) =>
      new Date(row.original.created_at).toLocaleDateString("vi-VN"),
  },
  {
    accessorKey: "created_by.email",
    header: "Người Tạo",
  },
  {
    accessorKey: "completed_at",
    header: "Ngày Hoàn Tất",
    cell: ({ row }) =>
      row.original.completed_at
        ? new Date(row.original.completed_at).toLocaleDateString("vi-VN")
        : "N/A",
  },
];

export default function StockTakingListPage() {
  const { data: sessions = [], isLoading } = useStockTakes();
  const { createMutation } = useStockTakeMutations();

  const columns = useMemo(() => getColumns(), []);

  if (isLoading) {
    return <FullPageLoader text="Đang tải danh sách phiên kiểm kê..." />;
  }

  return (
    <>
      <PageHeader
        title="Kiểm kê kho"
        description="Quản lý các phiên kiểm kê và đối chiếu tồn kho."
        actionNode={
          <Button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            {createMutation.isPending ? "Đang tạo..." : "Tạo phiên mới"}
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={sessions}
        toolbarProps={{
          searchColumnId: "code",
          searchPlaceholder: "Tìm theo mã phiên...",
        }}
      />
    </>
  );
}
