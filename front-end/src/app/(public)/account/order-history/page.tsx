// src/app/(public)/account/orders/page.tsx
"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataStateMessage } from "@/components/common/DataStateMessage";

export default function OrderHistoryPage() {
  // TODO: Fetch order history data using a hook
  const orders: any[] = []; // Dữ liệu giả

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lịch sử mua hàng</CardTitle>
        <CardDescription>
          Theo dõi các đơn hàng sản phẩm và liệu trình đã mua của bạn.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <DataStateMessage message="Bạn chưa có đơn hàng nào." />
        ) : (
          <div>{/* TODO: Render order list here */}</div>
        )}
      </CardContent>
    </Card>
  );
}
