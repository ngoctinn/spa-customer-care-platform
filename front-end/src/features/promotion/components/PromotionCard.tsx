// src/features/promotion/components/PromotionCard.tsx
import { Promotion } from "@/features/promotion/types";
import DisplayCard from "@/components/common/DisplayCard";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface PromotionCardProps {
  promotion: Promotion;
}

export default function PromotionCard({ promotion }: PromotionCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return "Đang cập nhật";
    }

    return date.toLocaleDateString("vi-VN");
  };

  return (
    <DisplayCard
      href={`/promotions/${promotion.id}`} // Link to promotion detail page
      imageUrl={promotion.image_url || "/images/default-promotion.jpg"}
      title={promotion.title}
      description={promotion.description}
      footerContent={
        <div className="flex justify-between items-center w-full text-sm">
          <Badge variant="destructive">-{promotion.discount_percent}%</Badge>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>
              {formatDate(promotion.start_date)} -{" "}
              {formatDate(promotion.end_date)}
            </span>
          </div>
        </div>
      }
    />
  );
}
