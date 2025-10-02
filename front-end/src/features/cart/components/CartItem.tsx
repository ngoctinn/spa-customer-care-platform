// src/features/cart/components/CartItem.tsx
"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Trash2 } from "lucide-react";
import useCartStore, { CartItem } from "@/features/cart/stores/cart-store";
import Link from "next/link";

interface CartItemProps {
  item: CartItem;
}

export function CartItemCard({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore();

  const handleQuantityChange = (newQuantity: number) => {
    updateQuantity(item.id, newQuantity);
  };

  const itemUrl =
    item.type === "product"
      ? `/products/${item.id}`
      : item.type === "service"
      ? `/services/${item.id}`
      : `/treatment-plans/${item.id}`;

  return (
    <div className="flex items-start gap-4 py-4">
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          className="object-contain p-1"
        />
      </div>
      <div className="flex-1">
        <Link
          href={itemUrl}
          className="font-semibold hover:underline line-clamp-2"
        >
          {item.name}
        </Link>
        <p className="mt-1 text-primary font-medium">
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(item.price)}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleQuantityChange(item.quantity - 1)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              className="h-8 w-14 text-center"
              value={item.quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
              min={1}
            />
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleQuantityChange(item.quantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => removeItem(item.id)}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
