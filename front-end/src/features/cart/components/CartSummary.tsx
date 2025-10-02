// src/features/cart/components/CartSummary.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import useCartStore from "@/features/cart/stores/cart-store";
import { useRouter } from "next/navigation";

export function CartSummary() {
  const { items } = useCartStore();
  const router = useRouter();

  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  // Bạn có thể thêm logic tính phí ship và thuế ở đây
  const shippingFee = 0;
  const total = subtotal + shippingFee;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tóm tắt đơn hàng</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span>Tạm tính</span>
          <span className="font-medium">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(subtotal)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Phí vận chuyển</span>
          <span className="font-medium">
            {shippingFee > 0
              ? new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(shippingFee)
              : "Miễn phí"}
          </span>
        </div>
        <Separator />
        <div className="flex justify-between font-bold text-lg">
          <span>Tổng cộng</span>
          <span>
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(total)}
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          size="lg"
          className="w-full"
          onClick={() => router.push("/checkout")}
          disabled={items.length === 0}
        >
          Tiến hành thanh toán
        </Button>
      </CardFooter>
    </Card>
  );
}
