// src/components/screens/products/product-card.tsx
import { Product } from "@/features/product/types";
import DisplayCard from "@/components/common/DisplayCard";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.images?.find((img) => img.is_primary === true);
  const primaryImageUrl =
    primaryImage?.url ??
    product.images?.[0]?.url ??
    "/images/default-product.jpg";
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
