"use client";
import { getPrimaryImageUrl } from "@/lib/image-utils";
import { useQuery } from "@tanstack/react-query";
import { getTreatmentPlanById } from "@/features/treatment/api/treatment.api";
import { ReviewList } from "@/features/review/components/ReviewList";
import TreatmentSteps from "@/features/treatment/components/TreatmentSteps";
import { notFound } from "next/navigation";
import { PackageCheck, Tag } from "lucide-react";
import { useState, useEffect, use } from "react";
import { FullPageLoader } from "@/components/ui/spinner";
import { useReviews } from "@/features/review/hooks/useReviews";
import { useServices } from "@/features/service/hooks/useServices";
import { PurchaseActions } from "@/components/common/PurchaseActions";
import { DetailPageLayout } from "@/components/common/DetailPageLayout";

interface TreatmentPlanDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function TreatmentPlanDetailPage({
  params,
}: TreatmentPlanDetailPageProps) {
  const { id } = use(params);
  const {
    data: plan,
    isLoading: isLoadingPlan,
    error,
  } = useQuery({
    queryKey: ["treatmentPlan", id],
    queryFn: () => getTreatmentPlanById(id),
  });

  const { data: allReviews = [], isLoading: isLoadingReviews } = useReviews();
  const { data: allServices = [], isLoading: isLoadingServices } =
    useServices();

  const primaryImageUrl = getPrimaryImageUrl(
    plan?.images,
    plan?.primary_image_id
  );

  const [mainImage, setMainImage] = useState<string>(primaryImageUrl);
  useEffect(() => {
    if (primaryImageUrl) {
      setMainImage(primaryImageUrl);
    }
  }, [primaryImageUrl]);

  const isLoading = isLoadingPlan || isLoadingReviews || isLoadingServices;

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (error || !plan) {
    notFound();
  }

  const planReviews = allReviews.filter((review) => review.item_id === plan.id);

  const thumbnailImages = plan.images?.map((img) => img.url) || [];

  return (
    <DetailPageLayout
      mainImage={mainImage}
      imageAlt={plan.name}
      thumbnailUrls={thumbnailImages}
      onThumbnailClick={setMainImage}
      title={<h1 className="text-4xl font-bold mb-4">{plan.name}</h1>}
      description={<p className="text-muted-foreground">{plan.description}</p>}
      details={
        <>
          <div className="flex items-center">
            <PackageCheck className="mr-2 h-5 w-5" />
            <span>{plan.total_sessions} buổi</span>
          </div>
          <div className="flex items-center">
            <Tag className="mr-2 h-5 w-5" />
            <span className="font-semibold">
              {new Intl.NumberFormat("vi-VN").format(plan.price)} VNĐ
            </span>
          </div>
        </>
      }
      purchaseActions={
        <PurchaseActions
          item={{
            id: plan.id,
            name: plan.name,
            price: plan.price,
            imageUrl: primaryImageUrl || "/images/placeholder.png",
            type: "treatment",
          }}
        />
      }
    >
      <TreatmentSteps plan={plan} allServices={allServices} />
      <div className="mt-12">
        <ReviewList reviews={planReviews} />
      </div>
    </DetailPageLayout>
  );
}
