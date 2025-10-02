// src/features/booking/components/ServiceSelection.tsx
"use client";

import { useServices } from "@/features/service/hooks/useServices";
import { useTreatmentPlans } from "@/features/treatment/hooks/useTreatmentPlans";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FullPageLoader } from "@/components/ui/spinner";
interface ServiceSelectionProps {
  onSelect: (id: string, type: "service" | "treatment") => void;
}

export default function ServiceSelection({ onSelect }: ServiceSelectionProps) {
  const { data: services, isLoading: isLoadingServices } = useServices();
  const { data: treatments, isLoading: isLoadingTreatments } =
    useTreatmentPlans();

  if (isLoadingServices || isLoadingTreatments) {
    return <FullPageLoader />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bước 1: Chọn dịch vụ hoặc liệu trình</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Dịch vụ lẻ</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {services?.map((service) => (
              <Button
                key={service.id}
                variant="outline"
                className="h-auto py-4"
                onClick={() => onSelect(service.id, "service")}
              >
                {service.name}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-3">Liệu trình trọn gói</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {treatments?.map((treatment) => (
              <Button
                key={treatment.id}
                variant="outline"
                className="h-auto py-4"
                onClick={() => onSelect(treatment.id, "treatment")}
              >
                {treatment.name}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
