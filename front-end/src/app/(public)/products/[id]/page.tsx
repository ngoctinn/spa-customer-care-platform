"use client";
import { getPrimaryImageUrl } from "@/lib/image-utils";
import { useQuery } from "@tanstack/react-query";
import { getProductById } from "@/features/product/api/product.api";
import { ReviewList } from "@/features/review/components/ReviewList";
import { notFound } from "next/navigation";
import { useState, useEffect, use } from "react";
import { Badge } from "@/components/ui/badge";
import { useReviews } from "@/features/review/hooks/useReviews";
import { PurchaseActions } from "@/components/common/PurchaseActions";
import { DetailPageLayout } from "@/components/common/DetailPageLayout";
import { Tag } from "lucide-react";
import { FullPageLoader } from "@/components/ui/spinner";
import { MessageSquarePlus } from "lucide-react"; // Bổ sung icon
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AddReviewForm } from "@/features/review/components/AddReviewForm";
import { useAuth } from "@/contexts/AuthContexts";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = use(params);
  const { user } = useAuth();
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const { data: allReviews = [], isLoading: isLoadingReviews } = useReviews();

  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
  });

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
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold">
            Đánh giá sản phẩm ({productReviews.length})
          </h3>
          {user && (
            <Dialog
              open={isReviewDialogOpen}
              onOpenChange={setIsReviewDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="outline">
                  <MessageSquarePlus className="mr-2 h-4 w-4" />
                  Viết đánh giá
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                  <DialogTitle>Đánh giá sản phẩm: {product.name}</DialogTitle>
                </DialogHeader>
                <AddReviewForm
                  itemId={product.id}
                  itemType="product"
                  onSuccess={() => setIsReviewDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
        {productReviews.length > 0 ? (
          <ReviewList reviews={productReviews} />
        ) : (
          <p className="text-muted-foreground py-8 text-center">
            Chưa có đánh giá nào cho sản phẩm này.
          </p>
        )}
      </div>{" "}
    </DetailPageLayout>
  );
}
