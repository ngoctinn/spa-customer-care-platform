// src/app/(public)/products/page.tsx
"use client";

import ProductCard from "@/features/product/components/ProductCard";
import { useProducts } from "@/features/product/hooks/useProducts";
import { Product } from "@/features/product/types";
import { ListPageLayout } from "@/components/layout/public/ListPageLayout";

export default function ProductsPage() {
  return (
    <ListPageLayout<Product>
      title="Sản Phẩm Chăm Sóc Tại Nhà"
      description="Mang trải nghiệm spa về nhà với các sản phẩm cao cấp được chuyên gia của chúng tôi tin dùng."
      searchPlaceholder="Tìm kiếm sản phẩm..."
      useDataHook={useProducts}
      filterFn={(product, searchTerm) =>
        product.name.toLowerCase().includes(searchTerm)
      }
      renderItem={(product) => <ProductCard product={product} />}
    />
  );
}
