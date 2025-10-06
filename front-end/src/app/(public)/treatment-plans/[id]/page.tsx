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

interface TreatmentPlanDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function TreatmentPlanDetailPage({
  params,
}: TreatmentPlanDetailPageProps) {
  const { id } = use(params);
  const { user } = useAuth();
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
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
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold">
            Đánh giá liệu trình ({planReviews.length})
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
                  <DialogTitle>Đánh giá liệu trình: {plan.name}</DialogTitle>
                </DialogHeader>
                <AddReviewForm
                  itemId={plan.id}
                  itemType="treatment"
                  onSuccess={() => setIsReviewDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
        {planReviews.length > 0 ? (
          <ReviewList reviews={planReviews} />
        ) : (
          <p className="text-muted-foreground py-8 text-center">
            Chưa có đánh giá nào cho liệu trình này.
          </p>
        )}
      </div>
    </DetailPageLayout>
  );
}
