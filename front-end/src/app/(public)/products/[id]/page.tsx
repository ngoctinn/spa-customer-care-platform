"use client";
import { getPrimaryImageUrl } from "@/lib/image-utils";
import { useProductById } from "@/features/product/hooks/useProducts";
import { ReviewList } from "@/features/review/components/ReviewList";
import { notFound } from "next/navigation";
import { useState, useEffect, use } from "react";
import { Badge } from "@/components/ui/badge";
import { useReviews } from "@/features/review/hooks/useReviews";
import { PurchaseActions } from "@/components/common/PurchaseActions";
import { DetailPageLayout } from "@/components/common/DetailPageLayout";
import { Tag } from "lucide-react";
import { FullPageLoader } from "@/components/ui/spinner";
interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = use(params);
  const { data: allReviews = [], isLoading: isLoadingReviews } = useReviews();

  const {
    data: product,
    isLoading,
    error,
  } = useProductById(id);

  const primaryImageUrl = getPrimaryImageUrl(
    product?.images,
    product?.primary_image_id
  );

  const [mainImage, setMainImage] = useState<string>(primaryImageUrl);
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

  const productImages =
    product.images?.map((img) => ({
      url: img.url,
      alt: product.name,
    })) || [];

  return (
    <DetailPageLayout
      mainImage={mainImage}
      imageAlt={product.name}
      images={productImages}
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
