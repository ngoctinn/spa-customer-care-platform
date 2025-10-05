// src/app/(public)/products/page.tsx
"use client";

import { Input } from "@/components/ui/input";
import ProductCard from "@/features/product/components/ProductCard";
import { useProducts } from "@/features/product/hooks/useProducts";
import { useMemo, useState } from "react";
import { DisplayCardSkeleton } from "@/components/common/DisplayCardSkeleton";
import { DataStateMessage } from "@/components/common/DataStateMessage";

export default function ProductsPage() {
  const {
    data: products = [],
    isLoading,
    isError,
    error,
  } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <DisplayCardSkeleton key={index} />
          ))}
        </div>
      );
    }

    if (isError) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể tải danh sách sản phẩm.";
      return (
        <DataStateMessage
          variant="error"
          message="Không thể tải danh sách sản phẩm"
          description={message}
          className="mx-auto max-w-xl"
        />
      );
    }

    if (products.length === 0) {
      return (
        <DataStateMessage
          message="Hiện chưa có sản phẩm nào được cập nhật."
          className="mx-auto max-w-xl"
        />
      );
    }

    if (filteredProducts.length === 0) {
      return (
        <DataStateMessage
          message="Không tìm thấy sản phẩm phù hợp"
          description={`Không có sản phẩm nào khớp với từ khóa "${searchTerm}".`}
          className="mx-auto max-w-xl"
        />
      );
    }

    return (
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight">
          Sản Phẩm Chăm Sóc Tại Nhà
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Mang trải nghiệm spa về nhà với các sản phẩm cao cấp được chuyên gia
          của chúng tôi tin dùng.
        </p>
      </header>

      <div className="mb-8 max-w-md mx-auto">
        <Input
          type="search"
          placeholder="Tìm kiếm sản phẩm..."
          className="w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {renderContent()}
    </div>
  );
}
