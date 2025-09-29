"use client";

import { useQuery } from "@tanstack/react-query";
import { getProductById } from "@/features/product/api/product.api";
import { ReviewList } from "@/features/review/components/ReviewList";
import { notFound } from "next/navigation";
import { useState, useEffect } from "react";
import FullPageLoader from "@/components/common/FullPageLoader";
import { Badge } from "@/components/ui/badge";
import { useReviews } from "@/features/review/hooks/useReviews";
import { PurchaseActions } from "@/components/common/PurchaseActions";
import { DetailPageLayout } from "@/components/common/DetailPageLayout";
import { Tag } from "lucide-react";

interface ProductDetailPageProps {
  params: { id: string };
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = params;

  const { data: allReviews = [], isLoading: isLoadingReviews } = useReviews();

  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
  });

  const primaryImageUrl =
    product?.images?.find((img) => img.is_primary)?.url ||
    product?.images?.[0]?.url ||
    null;
  const [mainImage, setMainImage] = useState<string | null>(primaryImageUrl);
  useEffect(() => {
    if (primaryImageUrl) {
      setMainImage(primaryImageUrl);
    }
  }, [primaryImageUrl]);

  if (isLoading || isLoadingReviews) {
    return <FullPageLoader />;
  }

  if (error || !product) {
    notFound();
  }

  const productReviews = allReviews.filter(
    (review) => review.item_id === product.id
  );

  const thumbnailImages = product.images?.map((img) => img.url) || [];

  return (
    <DetailPageLayout
      mainImage={mainImage}
      imageAlt={product.name}
      thumbnailUrls={thumbnailImages}
      onThumbnailClick={setMainImage}
      title={<h1 className="text-4xl font-bold mb-4">{product.name}</h1>}
      description={
        <p className="text-muted-foreground">{product.description}</p>
      }
      details={
        <>
          <div className="flex items-center">
            <Tag className="mr-2 h-5 w-5" />
            <span className="font-semibold">
              {new Intl.NumberFormat("vi-VN").format(product.price)} VNĐ
            </span>
          </div>
          <Badge variant={product.stock > 0 ? "default" : "destructive"}>
            {product.stock > 0 ? `Còn hàng (${product.stock})` : "Hết hàng"}
          </Badge>
        </>
      }
      purchaseActions={
        <PurchaseActions
          item={{
            id: product.id,
            name: product.name,
            price: product.price,
            imageUrl: primaryImageUrl || "/images/placeholder.png",
            type: "product",
          }}
          disabled={product.stock === 0}
        />
      }
    >
      <ReviewList reviews={productReviews} />
    </DetailPageLayout>
  );
}
