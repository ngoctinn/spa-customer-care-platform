"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Dữ liệu giả cho đơn hàng
const mockOrders = [
  {
    id: "ORD-001",
    date: "2024-07-15",
    status: "Đã giao hàng",
    total: 1250000,
  },
  {
    id: "ORD-002",
    date: "2024-07-20",
    status: "Đang xử lý",
    total: 750000,
  },
  {
    id: "ORD-003",
    date: "2024-06-30",
    status: "Đã hủy",
    total: 500000,
  },
  {
    id: "ORD-004",
    date: "2024-05-12",
    status: "Đã giao hàng",
    total: 2100000,
  },
];

// Helper để định dạng tiền tệ
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// Định nghĩa các biến thể (variant) hợp lệ cho Badge
type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export function OrderHistoryList() {
  const getStatusVariant = (status: string): BadgeVariant => {
    switch (status) {
      case "Đã giao hàng":
        return "default";
      case "Đang xử lý":
        return "secondary";
      case "Đã hủy":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đơn hàng của bạn</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Mã đơn hàng</TableHead>
              <TableHead>Ngày đặt</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Tổng tiền</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockOrders.length > 0 ? (
              mockOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(order.total)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      Xem chi tiết
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Bạn chưa có đơn hàng nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
