"use client";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { getServiceById } from "@/features/service/api/service.api";
import { ReviewList } from "@/features/review/components/ReviewList";
import { Clock, Tag } from "lucide-react";
import { notFound } from "next/navigation";
import { useState, useEffect } from "react";
import { useReviews } from "@/features/review/hooks/useReviews";
import { FullPageLoader } from "@/components/ui/spinner";
import { DetailPageLayout } from "@/components/common/DetailPageLayout";
import { PurchaseActions } from "@/components/common/PurchaseActions";

interface ServiceDetailPageProps {
  params: { id: string };
}

export default function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const { id } = params;
  const [mainImage, setMainImage] = useState<string | null>(null);

  const {
    data: service,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["service", id],
    queryFn: () => getServiceById(id),
  });

  const { data: allReviews = [], isLoading: isLoadingReviews } = useReviews();

  useEffect(() => {
    if (service?.images && service.images.length > 0) {
      const primaryImg =
        service.images.find((img) => img.isPrimary) || service.images[0];
      setMainImage(primaryImg.url);
    }
  }, [service]);

  if (isLoading || isLoadingReviews) {
    return <FullPageLoader text="Đang tải dịch vụ..." />;
  }

  if (error || !service) {
    notFound();
  }

  const serviceReviews = allReviews.filter(
    (review) => review.serviceId === service.id
  );

  const thumbnailImages = service.images?.map((img) => img.url) || [];
  const primaryImageUrl = service.images?.find((img) => img.isPrimary)?.url;
  return (
    <DetailPageLayout
      mainImage={mainImage}
      imageAlt={service.name}
      thumbnailUrls={thumbnailImages}
      onThumbnailClick={setMainImage}
      title={<h1 className="text-4xl font-bold mb-4">{service.name}</h1>}
      description={
        <p className="text-muted-foreground">{service.description}</p>
      }
      details={
        <>
          <div className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            <span>{service.duration_minutes} phút</span>
          </div>
          <div className="flex items-center">
            <Tag className="mr-2 h-5 w-5" />
            <span className="font-semibold">
              {new Intl.NumberFormat("vi-VN").format(service.price)} VNĐ
            </span>
          </div>
        </>
      }
      purchaseActions={
        <PurchaseActions
          item={{
            id: service.id,
            name: service.name,
            price: service.price,
            imageUrl: primaryImageUrl || "/images/placeholder.png",
            type: "service",
          }}
          bookNowLink={`/booking?serviceId=${service.id}`}
        />
      }
    >
      <div className="space-y-6">
        {service.preparation_notes && (
          <div>
            <h3 className="text-xl font-semibold mb-2">
              Chuẩn bị trước dịch vụ
            </h3>
            <p className="text-muted-foreground">{service.preparation_notes}</p>
          </div>
        )}
        {service.aftercare_instructions && (
          <div>
            <h3 className="text-xl font-semibold mb-2">Chăm sóc sau dịch vụ</h3>
            <p className="text-muted-foreground">
              {service.aftercare_instructions}
            </p>
          </div>
        )}
        {service.contraindications && (
          <div>
            <h3 className="text-xl font-semibold mb-2">Chống chỉ định</h3>
            <p className="text-muted-foreground">{service.contraindications}</p>
          </div>
        )}
      </div>

      <Separator className="my-8" />
      <ReviewList reviews={serviceReviews} />
    </DetailPageLayout>
  );
}
