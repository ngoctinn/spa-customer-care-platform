// src/features/checkout/components/pos/OrderSummary.tsx
"use client";

import { Separator } from "@/components/ui/separator";

interface OrderSummaryProps {
  total: number;
  discountFromPoints: number;
  prepaidCardDiscount: number;
  finalTotal: number;
}

export function OrderSummary({
  total,
  discountFromPoints,
  prepaidCardDiscount,
  finalTotal,
}: OrderSummaryProps) {
  return (
    <>
      <Separator />
      <div className="flex justify-between font-bold text-lg">
        <span>Tổng cộng</span>
        <span>{total.toLocaleString("vi-VN")}đ</span>
      </div>

      {discountFromPoints > 0 && (
        <div className="flex justify-between text-sm font-medium text-destructive">
          <span>Giảm giá từ điểm</span>
          <span>-{discountFromPoints.toLocaleString("vi-VN")}đ</span>
        </div>
      )}

      {prepaidCardDiscount > 0 && (
        <div className="flex justify-between text-sm font-medium text-destructive">
          <span>Giảm giá từ thẻ</span>
          <span>-{prepaidCardDiscount.toLocaleString("vi-VN")}đ</span>
        </div>
      )}

      <div className="flex justify-between font-bold text-lg text-primary">
        <span>Khách cần trả</span>
        <span>
          {(finalTotal > 0 ? finalTotal : 0).toLocaleString("vi-VN")}đ
        </span>
      </div>
    </>
  );
}
