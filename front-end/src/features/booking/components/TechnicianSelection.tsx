"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useTechniciansByService } from "@/features/staff/hooks/useStaff";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface TechnicianSelectionProps {
  serviceId: string;
  selectedValue: string | undefined;
  onValueChange: (technicianId: string) => void;
}

export default function TechnicianSelection({
  serviceId,
  selectedValue,
  onValueChange,
}: TechnicianSelectionProps) {
  const { data: technicians = [], isLoading } =
    useTechniciansByService(serviceId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bước 2: Chọn Kỹ thuật viên</CardTitle>
        <CardDescription>
          Bạn có thể chọn một kỹ thuật viên bạn yêu thích hoặc để chúng tôi sắp
          xếp.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Spinner />
          </div>
        ) : (
          <RadioGroup
            value={selectedValue}
            onValueChange={onValueChange}
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            {/* Tùy chọn "Bất kỳ ai" */}
            <Label
              htmlFor="any-tech"
              className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-md border p-4 cursor-pointer transition-colors hover:bg-muted/50",
                selectedValue === "any" ? "border-primary bg-muted/50" : ""
              )}
            >
              <RadioGroupItem
                value="any"
                id="any-tech"
                className="sr-only" // Ẩn nút radio gốc
              />
              <Avatar className="h-12 w-12">
                <AvatarFallback className="text-xs">Any</AvatarFallback>
              </Avatar>
              <span className="font-bold text-center">Bất kỳ ai</span>
            </Label>

            {/* Danh sách kỹ thuật viên */}
            {technicians.map((tech) => (
              <Label
                key={tech.id}
                htmlFor={tech.id}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 rounded-md border p-4 cursor-pointer transition-colors hover:bg-muted/50",
                  selectedValue === tech.id ? "border-primary bg-muted/50" : ""
                )}
              >
                <RadioGroupItem
                  value={tech.id}
                  id={tech.id}
                  className="sr-only" // Ẩn nút radio gốc
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
            ))}
          </RadioGroup>
        )}
      </CardContent>
    </Card>
  );
}
