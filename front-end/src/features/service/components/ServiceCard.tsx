// src/components/screens/services/service-card.tsx
import { Service } from "@/features/service/types";
import DisplayCard from "@/components/common/DisplayCard";
import { Clock } from "lucide-react";
import { getPrimaryImageUrl } from "@/lib/image-utils";

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const primaryImageUrl = getPrimaryImageUrl(
    service.images,
    "/images/default-service.jpg"
  );
  return (
    <DisplayCard
      href={`/services/${service.id}`}
      imageUrl={primaryImageUrl}
      title={service.name}
      description={service.description}
      footerContent={
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{service.duration_minutes} phút</span>
          </div>
          <span className="text-lg font-semibold text-primary">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(service.price)}
          </span>
        </div>
      }
    />
  );
}
