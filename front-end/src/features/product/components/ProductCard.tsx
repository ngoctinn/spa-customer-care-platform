// src/components/screens/products/product-card.tsx
import { Product } from "@/features/product/types";
import DisplayCard from "@/components/common/DisplayCard";
import { Badge } from "@/components/ui/badge";
import { getPrimaryImageUrl } from "@/lib/image-utils";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const primaryImageUrl = getPrimaryImageUrl(
    product.images,
    "/images/default-product.jpg"
  );
  return (
    <DisplayCard
      href={`/products/${product.id}`}
      imageUrl={primaryImageUrl}
      title={product.name}
      description={product.description}
      footerContent={
        <div className="flex justify-between items-center w-full">
          <Badge variant={product.stock > 0 ? "outline" : "destructive"}>
            {product.stock > 0 ? `Còn hàng: ${product.stock}` : "Hết hàng"}
          </Badge>
          <span className="text-lg font-semibold text-primary">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(product.price)}
          </span>
        </div>
      }
    />
  );
}
