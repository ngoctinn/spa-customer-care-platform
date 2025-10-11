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
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import useCartStore from "@/features/cart/stores/cart-store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function CartSummary() {
  const { items } = useCartStore();
  const router = useRouter();
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  // Bạn có thể thêm logic tính phí ship và thuế ở đây
  const shippingFee = 0;
  const total = subtotal + shippingFee - discount;

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      toast.warning("Vui lòng nhập mã khuyến mãi.");
      return;
    }
    setIsLoading(true);
    try {
      // **GIẢ LẬP GỌI API**
      // Trong thực tế, bạn sẽ gọi API để xác thực mã
      // const response = await apiClient.post('/promotions/validate', { code: promoCode });
      // const discountAmount = response.data.discountAmount;
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Giả lập độ trễ mạng

      if (promoCode.toUpperCase() === "SALE10") {
        const calculatedDiscount = subtotal * 0.1;
        setDiscount(calculatedDiscount);
        toast.success("Áp dụng mã khuyến mãi thành công!", {
          description: `Bạn được giảm ${new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(calculatedDiscount)}.`,
        });
      } else {
        toast.error("Mã khuyến mãi không hợp lệ hoặc đã hết hạn.");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi áp dụng mã khuyến mãi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tóm tắt đơn hàng</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Nhập mã khuyến mãi"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            disabled={isLoading}
          />
          <Button onClick={handleApplyPromoCode} disabled={isLoading}>
            {isLoading ? "Đang..." : "Áp dụng"}
          </Button>
        </div>
        <Separator />
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
