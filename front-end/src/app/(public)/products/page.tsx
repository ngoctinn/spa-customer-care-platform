// src/app/(public)/products/page.tsx
"use client";

import { Input } from "@/components/ui/input";
import ProductCard from "@/features/product/components/ProductCard";
import { useProducts } from "@/features/product/hooks/useProducts";
import { useMemo, useState } from "react";
import { FullPageLoader } from "@/components/ui/spinner";

export default function ProductsPage() {
  const { data: products = [], isLoading } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  if (isLoading) {
    return <FullPageLoader text="Đang tải danh sách sản phẩm..." />;
  }

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

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground">
            Không tìm thấy sản phẩm nào phù hợp với từ khóa &quot;{searchTerm}
            &quot;.
          </p>
        </div>
      )}
    </div>
  );
}
