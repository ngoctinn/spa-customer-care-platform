"use client";

import { useMemo, useState, useEffect, use } from "react";
import { useQuery } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { Clock, Tag } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { FullPageLoader } from "@/components/ui/spinner";
import { DetailPageLayout } from "@/components/common/DetailPageLayout";
import { PurchaseActions } from "@/components/common/PurchaseActions";
import { ReviewList } from "@/features/review/components/ReviewList";
import { getServiceById } from "@/features/service/api/service.api";
import { useReviews } from "@/features/review/hooks/useReviews";
import { getPrimaryImageUrl } from "@/lib/image-utils";
import { useAuth } from "@/features/auth/contexts/AuthContexts";
import { useCustomerProfile } from "@/features/customer/hooks/useCustomerProfile";
import PurchasedItemBanner from "@/components/common/PurchasedItemBanner";

interface ServiceDetailPageProps {
  params: Promise<{ id: string }>;
}

// Component con để kiểm tra và hiển thị banner
const OwnershipChecker = ({ serviceId }: { serviceId: string }) => {
  const { user } = useAuth();
  const { data: customer, isLoading: isLoadingProfile } = useCustomerProfile();

  const purchasedService = useMemo(() => {
    if (!user || !customer?.customer_profile?.purchased_services) {
      return null;
    }
    return customer.customer_profile.purchased_services.find(
      (ps) => ps.service_id === serviceId && ps.quantity > 0
    );
  }, [user, customer, serviceId]);

  if (isLoadingProfile || !user) {
    return null; // Không hiển thị gì khi đang tải hoặc chưa đăng nhập
  }

  if (purchasedService) {
    return (
      <PurchasedItemBanner
        type="service"
        remainingInfo={`Bạn còn ${purchasedService.quantity} lượt sử dụng.`}
        actionHref={`/booking?serviceId=${serviceId}`}
        actionText="Sử dụng ngay"
      />
    );
  }

  return null;
};

export default function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const { id } = use(params);
  const { data: allReviews = [], isLoading: isLoadingReviews } = useReviews();
  const {
    data: service,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["service", id],
    queryFn: () => getServiceById(id),
  });

  const primaryImageUrl = getPrimaryImageUrl(
    service?.images,
    service?.primary_image_id
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

  if (error || !service) {
    notFound();
  }

  const serviceReviews = allReviews.filter(
    (review) => review.item_id === service.id
  );
  const serviceImages =
    service.images?.map((img) => ({ url: img.url, alt: service.name })) || [];

  return (
    <div className="container mx-auto py-12">
      <OwnershipChecker serviceId={service.id} />

      <DetailPageLayout
        mainImage={mainImage}
        imageAlt={service.name}
        images={serviceImages}
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
              <p className="text-muted-foreground">
                {service.preparation_notes}
              </p>
            </div>
          )}
          {service.aftercare_instructions && (
            <div>
              <h3 className="text-xl font-semibold mb-2">
                Chăm sóc sau dịch vụ
              </h3>
              <p className="text-muted-foreground">
                {service.aftercare_instructions}
              </p>
            </div>
          )}
          {service.contraindications && (
            <div>
              <h3 className="text-xl font-semibold mb-2">Chống chỉ định</h3>
              <p className="text-muted-foreground">
                {service.contraindications}
              </p>
            </div>
          )}
        </div>
        <Separator className="my-8" />
        <ReviewList reviews={serviceReviews} />
      </DetailPageLayout>
    </div>
  );
}
