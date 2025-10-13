// src/app/(public)/account/order-history/page.tsx
"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DataStateMessage } from "@/components/common/DataStateMessage";
import { FullPageLoader } from "@/components/ui/spinner";
import { useCustomerProfile } from "@/features/customer/hooks/useCustomerProfile";
import { useInvoices } from "@/features/checkout/hooks/useInvoices";
import { Invoice, InvoiceStatus } from "@/features/checkout/types";
import { cn } from "@/lib/utils";

// Helper function to map status to UI variant
const getStatusVariant = (
  status: InvoiceStatus
): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "paid":
      return "default";
    case "pending":
      return "secondary";
    case "cancelled":
      return "destructive";
    case "refunded":
      return "outline";
    default:
      return "outline";
  }
};

export default function OrderHistoryPage() {
  const { data: customer, isLoading: isLoadingProfile } = useCustomerProfile();
  const { data: invoices = [], isLoading: isLoadingInvoices } = useInvoices(
    customer?.customer_profile.id
  );

  const sortedInvoices = useMemo(() => {
    return [...invoices].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [invoices]);

  const isLoading = isLoadingProfile || isLoadingInvoices;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lịch sử mua hàng</CardTitle>
        <CardDescription>
          Theo dõi các đơn hàng sản phẩm và liệu trình đã mua của bạn.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <FullPageLoader text="Đang tải lịch sử đơn hàng..." />
          </div>
        ) : sortedInvoices.length === 0 ? (
          <DataStateMessage message="Bạn chưa có đơn hàng nào." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đơn hàng</TableHead>
                <TableHead>Ngày đặt</TableHead>
                <TableHead className="text-right">Tổng tiền</TableHead>
                <TableHead className="text-center">Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedInvoices.map((invoice: Invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">
                    #{invoice.id.substring(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell>
                    {new Date(invoice.created_at).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(invoice.total_amount)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getStatusVariant(invoice.status)}>
                      {invoice.status === "paid" && "Đã thanh toán"}
                      {invoice.status === "pending" && "Chờ xử lý"}
                      {invoice.status === "cancelled" && "Đã hủy"}
                      {invoice.status === "refunded" && "Đã hoàn tiền"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
