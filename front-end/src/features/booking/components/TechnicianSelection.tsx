// src/features/booking/components/TechnicianSelection.tsx
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useServiceById } from "@/features/service/hooks/useServices";
import { useTechniciansByService } from "@/features/staff/hooks/useStaff";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface TechnicianSelectionProps {
  serviceId: string;
  selectedValues: string[];
  onSelectionChange: (technicianIds: string[]) => void;
}

export default function TechnicianSelection({
  serviceId,
  selectedValues,
  onSelectionChange,
}: TechnicianSelectionProps) {
  const { data: service, isLoading: isLoadingService } =
    useServiceById(serviceId);
  const { data: technicians = [], isLoading: isLoadingTechnicians } =
    useTechniciansByService(serviceId);

  const requiredStaffCount = service?.required_staff || 1;
  const isSelectionDisabled = selectedValues.length >= requiredStaffCount;

  const handleCheckboxChange = (techId: string) => {
    const isSelected = selectedValues.includes(techId);
    let newSelection;

    if (isSelected) {
      newSelection = selectedValues.filter((id) => id !== techId);
    } else if (!isSelectionDisabled) {
      newSelection = [...selectedValues, techId];
    } else {
      return; // Do nothing if selection is disabled
    }
    onSelectionChange(newSelection);
  };

  if (isLoadingService || isLoadingTechnicians) {
    return (
      <Card>
        <CardContent className="flex justify-center p-8">
          <Spinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bước 2: Chọn Kỹ thuật viên</CardTitle>
        <CardDescription>
          Dịch vụ này yêu cầu {requiredStaffCount} nhân viên. Bạn có thể chọn
          trước hoặc để hệ thống tự sắp xếp. Đã chọn: {selectedValues.length} /{" "}
          {requiredStaffCount}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button variant="outline" onClick={() => onSelectionChange([])}>
          Để hệ thống tự sắp xếp
        </Button>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4">
          {technicians.map((tech) => {
            const isSelected = selectedValues.includes(tech.id);
            const isDisabled = !isSelected && isSelectionDisabled;
            return (
              <Label
                key={tech.id}
                htmlFor={tech.id}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 rounded-md border p-4 transition-colors",
                  isSelected
                    ? "border-primary bg-muted/50"
                    : "hover:bg-muted/50",
                  isDisabled
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                )}
              >
                <Checkbox
                  id={tech.id}
                  checked={isSelected}
                  onCheckedChange={() => handleCheckboxChange(tech.id)}
                  className="sr-only"
                  disabled={isDisabled}
                />
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={tech.avatar_url || ""}
                    alt={tech.full_name}
                  />
                  <AvatarFallback>{tech.full_name[0]}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-center">
                  {tech.full_name}
                </span>
              </Label>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
