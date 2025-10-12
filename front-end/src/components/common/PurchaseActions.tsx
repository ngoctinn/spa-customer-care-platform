"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart, Bolt, CalendarCheck, Plus, Minus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import useCartStore from "@/features/cart/stores/cart-store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface PurchaseActionsProps {
  item: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    type: "product" | "service" | "treatment";
  };
  bookNowLink?: string;
  disabled?: boolean;
}

export const PurchaseActions = ({
  item,
  bookNowLink,
  disabled = false,
}: PurchaseActionsProps) => {
  const { addItem } = useCartStore();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    addItem({ ...item, quantity });
    toast.success(`${quantity} "${item.name}" đã được thêm vào giỏ hàng!`);
  };

  const handleBuyNow = () => {
    addItem({ ...item, quantity });
    router.push("/checkout");
  };

  const quantityControl = (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        onClick={() => handleQuantityChange(quantity - 1)}
        disabled={quantity <= 1 || disabled}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        type="number"
        className="h-9 w-16 text-center"
        value={quantity}
        onChange={(e) => handleQuantityChange(parseInt(e.target.value, 10))}
        min={1}
        disabled={disabled}
      />
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        onClick={() => handleQuantityChange(quantity + 1)}
        disabled={disabled}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );

  if (item.type === "service" || item.type === "treatment") {
    return (
      <div className="space-y-4">
        <Button size="lg" asChild className="w-full" disabled={disabled}>
          <Link href={bookNowLink || `/booking?serviceId=${item.id}`}>
            <CalendarCheck className="mr-2 h-5 w-5" />
            Đặt lịch ngay
          </Link>
        </Button>
        <div className="flex flex-col sm:flex-row gap-4">
          {quantityControl}
          <div className="flex-1 grid grid-cols-2 gap-2">
            <Button
              size="lg"
              variant="outline"
              onClick={handleAddToCart}
              disabled={disabled}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Thêm vào giỏ
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleBuyNow}
              disabled={disabled}
            >
              <Bolt className="mr-2 h-5 w-5" />
              Mua ngay
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-start">{quantityControl}</div>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          size="lg"
          variant="outline"
          onClick={handleAddToCart}
          disabled={disabled}
          className="flex-1"
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          Thêm vào giỏ
        </Button>
        <Button
          size="lg"
          onClick={handleBuyNow}
          disabled={disabled}
          className="flex-1"
        >
          <Bolt className="mr-2 h-5 w-5" />
          Mua ngay
        </Button>
      </div>
    </div>
  );
};
