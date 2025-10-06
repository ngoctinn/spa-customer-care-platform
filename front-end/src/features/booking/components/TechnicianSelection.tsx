// src/features/booking/components/TechnicianSelection.tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTechniciansByService } from "@/features/staff/hooks/useStaff";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TechnicianDetailCard } from "./TechnicianDetailCard";
import { CheckCircle2, Info } from "lucide-react";
import { DataStateMessage } from "@/components/common/DataStateMessage";

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
          Chọn một kỹ thuật viên bạn tin tưởng hoặc để chúng tôi sắp xếp người
          phù hợp nhất.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Spinner />
          </div>
        ) : (
          <>
            <RadioGroup
              value={selectedValue}
              onValueChange={onValueChange}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
            >
              {/* --- Lựa chọn Bất kỳ ai --- */}
              <div>
                <RadioGroupItem
                  value="any"
                  id="any-tech"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="any-tech"
                  className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer relative h-full"
                >
                  <CheckCircle2 className="absolute top-2 right-2 h-5 w-5 text-primary opacity-0 peer-data-[state=checked]:opacity-100 transition-opacity" />
                  <span className="text-lg font-bold">Bất kỳ ai</span>
                  <span className="text-sm text-muted-foreground mt-1">
                    Chúng tôi sẽ chọn người tốt nhất
                  </span>
                </Label>
              </div>

              {/* --- Danh sách kỹ thuật viên --- */}
              {technicians.map((tech) => (
                <div key={tech.id}>
                  <RadioGroupItem
                    value={tech.id}
                    id={tech.id}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={tech.id}
                    className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer relative h-full"
                  >
                    <CheckCircle2 className="absolute top-2 right-2 h-5 w-5 text-primary opacity-0 peer-data-[state=checked]:opacity-100 transition-opacity" />
                    <Avatar className="h-16 w-16 mb-2">
                      <AvatarImage src={tech.avatar_url} />
                      <AvatarFallback>{tech.full_name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold">{tech.full_name}</span>

                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          onClick={(e) => e.preventDefault()} // Ngăn không cho label bị trigger
                          className="absolute bottom-1 right-1 text-muted-foreground hover:text-primary"
                        >
                          <Info className="h-4 w-4" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <TechnicianDetailCard technician={tech} />
                      </PopoverContent>
                    </Popover>
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {!isLoading && technicians.length === 0 && (
              <div className="mt-4">
                <DataStateMessage message="Không có kỹ thuật viên phù hợp" />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
