// src/features/booking/components/TechnicianSelection.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTechniciansByService } from "@/features/staff/hooks/useStaff";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

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
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center">
            <Spinner />
          </div>
        ) : (
          <RadioGroup
            value={selectedValue}
            onValueChange={onValueChange}
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="any" id="any-tech" />
              <Label htmlFor="any-tech" className="font-bold">
                Bất kỳ ai
              </Label>
            </div>
            {technicians.map((tech) => (
              <div key={tech.id} className="flex items-center space-x-3">
                <RadioGroupItem value={tech.id} id={tech.id} />
                <Label htmlFor={tech.id} className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={tech.avatar_url} />
                    <AvatarFallback>{tech.full_name[0]}</AvatarFallback>
                  </Avatar>
                  {tech.full_name}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}
      </CardContent>
    </Card>
  );
}
