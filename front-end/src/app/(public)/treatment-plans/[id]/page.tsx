"use client";

import { useMemo, useState, useEffect, use } from "react";
import { useQuery } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { PackageCheck, Tag } from "lucide-react";
import { FullPageLoader } from "@/components/ui/spinner";
import { DetailPageLayout } from "@/components/common/DetailPageLayout";
import { PurchaseActions } from "@/components/common/PurchaseActions";
import TreatmentSteps from "@/features/treatment/components/TreatmentSteps";
import { ReviewList } from "@/features/review/components/ReviewList";
import { getTreatmentPlanById } from "@/features/treatment/apis/treatment.api";
import { useReviews } from "@/features/review/hooks/useReviews";
import { useServices } from "@/features/service/hooks/useServices";
import { getPrimaryImageUrl } from "@/lib/image-utils";
import { useAuth } from "@/features/auth/contexts/AuthContexts";
import PurchasedItemBanner from "@/components/common/PurchasedItemBanner";
import apiClient from "@/lib/apiClient";
import { TreatmentPackage } from "@/features/treatment/types";

interface TreatmentPlanDetailPageProps {
  params: Promise<{ id: string }>;
}

// Giả định có API endpoint này để lấy tất cả các gói đã mua của user
const getMyPackages = async (): Promise<TreatmentPackage[]> => {
  return apiClient<TreatmentPackage[]>("/customers/me/packages");
};

// Component con để kiểm tra và hiển thị banner
const OwnershipChecker = ({ planId }: { planId: string }) => {
  const { user } = useAuth();
  const { data: purchasedPackages, isLoading } = useQuery({
    queryKey: ["myAllPackages"],
    queryFn: getMyPackages,
    enabled: !!user,
  });

  const ownedPackage = useMemo(() => {
    if (!user || !purchasedPackages) return null;
    return purchasedPackages.find(
      (pkg) =>
        pkg.treatment_plan_id === planId &&
        pkg.completed_sessions < pkg.total_sessions
    );
  }, [user, purchasedPackages, planId]);

  if (isLoading || !user) {
    return null;
  }

  if (ownedPackage) {
    return (
      <PurchasedItemBanner
        type="treatment"
        remainingInfo={`Đã hoàn thành ${ownedPackage.completed_sessions}/${ownedPackage.total_sessions} buổi.`}
        progressValue={
          (ownedPackage.completed_sessions / ownedPackage.total_sessions) * 100
        }
        actionHref={`/booking?treatmentId=${planId}`}
        actionText="Đặt buổi tiếp theo"
      />
    );
  }

  return null;
};

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
  const planImages =
    plan.images?.map((img) => ({ url: img.url, alt: plan.name })) || [];

  return (
    <div className="container mx-auto py-12">
      <OwnershipChecker planId={plan.id} />

      <DetailPageLayout
        mainImage={mainImage}
        imageAlt={plan.name}
        images={planImages}
        onThumbnailClick={setMainImage}
        title={<h1 className="text-4xl font-bold mb-4">{plan.name}</h1>}
        description={
          <p className="text-muted-foreground">{plan.description}</p>
        }
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
    </div>
  );
}
