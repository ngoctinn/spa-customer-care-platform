import { TreatmentPlan } from "@/features/treatment/types";
import DisplayCard from "@/components/common/DisplayCard";
import { PackageCheck } from "lucide-react";
import { getPrimaryImageUrl } from "@/lib/image-utils";

interface TreatmentPlanCardProps {
  plan: TreatmentPlan;
}

export default function TreatmentPlanCard({ plan }: TreatmentPlanCardProps) {
  const primaryImageUrl = getPrimaryImageUrl(
    plan.images,
    "/images/default-product.jpg"
  );
  return (
    <DisplayCard
      href={`/treatment-plans/${plan.id}`}
      imageUrl={primaryImageUrl}
      title={plan.name}
      description={plan.description}
      footerContent={
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2 text-muted-foreground">
            <PackageCheck className="w-4 h-4" />
            <span>{plan.total_sessions} buổi</span>
          </div>
          <span className="text-lg font-semibold text-primary">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(plan.price)}
          </span>
        </div>
      }
    />
  );
}
