// src/features/checkout/components/pos/PosInvoice.tsx
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CustomerSelector } from "./CustomerSelector";
import { PosCart } from "./PosCart";

export function PosInvoice() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Thông tin Hóa đơn</CardTitle>
        <CardDescription>
          Chọn khách hàng và các dịch vụ/sản phẩm cần thanh toán.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <CustomerSelector />
        <PosCart />
      </CardContent>
    </Card>
  );
}
