// src/app/(public)/cart/page.tsx
"use client";

import { CartItemCard } from "@/features/cart/components/CartItem";
import { CartSummary } from "@/features/cart/components/CartSummary";
import useCartStore from "@/features/cart/stores/cart-store";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const { items } = useCartStore();

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Giỏ hàng của bạn</h1>
      </header>
      <div className="grid lg:grid-cols-3 lg:gap-12 items-start">
        <div className="lg:col-span-2">
          {items.length > 0 ? (
            <div className="divide-y">
              {items.map((item) => (
                <CartItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
              <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">Giỏ hàng trống</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Hãy bắt đầu mua sắm để thêm sản phẩm vào đây.
              </p>
              <div className="mt-6">
                <Link
                  href="/products"
                  className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Tiếp tục mua sắm
                </Link>
              </div>
            </div>
          )}
        </div>
        <div className="sticky top-24">
          <CartSummary />
        </div>
      </div>
    </div>
  );
}
