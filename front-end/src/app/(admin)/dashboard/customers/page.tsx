// src/app/(admin)/dashboard/customers/page.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

import { ResourcePageLayout } from "@/features/management-pages/ResourcePageLayout";
import {
  useCustomerManagement,
  CustomerFormValues,
} from "@/features/customer/hooks/useCustomerManagement";
import { FullCustomerProfile } from "@/features/customer/types";
import CustomerFormFields from "@/features/customer/components/CustomerFormFields";
import { Table } from "@tanstack/react-table";

export default function CustomersPage() {
  const router = useRouter();
  const managementHook = useCustomerManagement();

  const handleMerge = (selectedCustomers: FullCustomerProfile[]) => {
    const ids = selectedCustomers.map((c) => c.id);
    router.push(`/dashboard/customers/merge?ids=${ids.join(",")}`);
  };

  // Cập nhật định nghĩa cột để thêm cột checkbox
  const columns: ColumnDef<FullCustomerProfile>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "full_name",
      header: "Tên khách hàng",
      cell: ({ row }) => (
        <Link
          href={`/dashboard/customers/${row.original.id}`}
          className="font-medium text-primary hover:underline"
        >
          {row.original.full_name}
        </Link>
      ),
    },
    { accessorKey: "email", header: "Email" },
    {
      accessorKey: "phone_number",
      header: "Số điện thoại",
    },
    {
      accessorKey: "loyalty_points",
      header: "Điểm thưởng",
      cell: ({ row }) =>
        row.original.loyalty_points?.toLocaleString("vi-VN") || 0,
    },
    {
      accessorKey: "last_visit",
      header: "Lần cuối đến",
      cell: ({ row }) =>
        row.original.last_visit
          ? new Date(row.original.last_visit).toLocaleDateString("vi-VN")
          : "Chưa có",
    },
  ];

  // Thêm nút "Hợp nhất" vào thanh công cụ
  const CustomToolbar = ({ table }: { table: Table<FullCustomerProfile> }) => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    if (selectedRows.length > 1) {
      return (
        <Button
          variant="outline"
          size="sm"
          className="ml-2 h-8"
          onClick={() => handleMerge(selectedRows.map((row) => row.original))}
        >
          <Users className="mr-2 h-4 w-4" />
          Hợp nhất ({selectedRows.length})
        </Button>
      );
    }
    return null;
  };

  return (
    <ResourcePageLayout<FullCustomerProfile, CustomerFormValues>
      title="Quản lý Khách hàng"
      description="Xem và quản lý thông tin khách hàng trong hệ thống."
      entityName="khách hàng"
      columns={columns}
      useManagementHook={useCustomerManagement}
      FormComponent={CustomerFormFields}
      toolbarProps={{
        searchColumnId: "full_name",
        searchPlaceholder: "Tìm theo tên hoặc SĐT...",
        CustomActions: CustomToolbar,
      }}
    />
  );
}
