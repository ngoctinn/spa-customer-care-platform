"use client";

import { ColumnDef } from "@tanstack/react-table";
import { z } from "zod";
import Link from "next/link"; // Import Link

import { ResourcePageLayout } from "@/features/management-pages/ResourcePageLayout";
import { useCustomerManagement } from "@/features/customer/hooks/useCustomerManagement";
import { FullCustomerProfile } from "@/features/customer/types";
import CustomerFormFields from "@/features/customer/components/CustomerFormFields";

const customerFormSchema = z.object({
  full_name: z.string().min(3, "Tên phải có ít nhất 3 ký tự."),
  phone: z.string().optional(),
  notes: z.string().optional(),
});
type CustomerFormValues = z.infer<typeof customerFormSchema>;

// Update columns to include a link
const columns: ColumnDef<FullCustomerProfile>[] = [
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
  { accessorKey: "phone", header: "Số điện thoại" },
  {
    accessorKey: "customer_profile.loyalty_points",
    header: "Điểm thưởng",
    cell: ({ row }) =>
      row.original.customer_profile.loyalty_points?.toLocaleString("vi-VN") ||
      0,
  },
  {
    accessorKey: "customer_profile.last_visit",
    header: "Lần cuối đến",
    cell: ({ row }) =>
      row.original.customer_profile.last_visit
        ? new Date(row.original.customer_profile.last_visit).toLocaleDateString(
            "vi-VN"
          )
        : "Chưa có",
  },
];

export default function CustomersPage() {
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
      }}
    />
  );
}
