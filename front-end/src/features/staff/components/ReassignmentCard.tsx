"use client";

import { useState } from "react";
import { Appointment } from "@/features/appointment/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSuggestedTechnicians } from "@/features/appointment/hooks/useAppointments";
import { useUpdateAppointment } from "@/features/appointment/hooks/useAppointments";
import { Spinner } from "@/components/ui/spinner";

interface ReassignmentCardProps {
  appointment: Appointment;
  onReassigned: (appointmentId: string) => void;
}

export default function ReassignmentCard({
  appointment,
  onReassigned,
}: ReassignmentCardProps) {
  const [selectedTech, setSelectedTech] = useState<string>("");
  const { data: suggestions = [], isLoading } = useSuggestedTechnicians(
    appointment.id
  );
  const { mutate: updateAppointment, isPending } = useUpdateAppointment();

  const handleReassign = () => {
    if (!selectedTech) return;
    updateAppointment(
      { id: appointment.id, data: { assigned_staff_ids: [selectedTech] } },
      {
        onSuccess: () => {
          onReassigned(appointment.id);
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Lịch hẹn lúc:{" "}
          {new Date(appointment.start_time).toLocaleString("vi-VN")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Thông tin lịch hẹn có thể thêm ở đây */}
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <Select
            onValueChange={setSelectedTech}
            value={selectedTech}
            disabled={isLoading}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Chọn nhân viên thay thế..." />
            </SelectTrigger>
            <SelectContent>
              {isLoading ? (
                <div className="flex justify-center p-2">
                  <Spinner />
                </div>
              ) : suggestions.length > 0 ? (
                suggestions.map((tech) => (
                  <SelectItem key={tech.id} value={tech.id}>
                    {tech.full_name}
                  </SelectItem>
                ))
              ) : (
                <div className="p-2 text-sm text-muted-foreground">
                  Không có gợi ý.
                </div>
              )}
            </SelectContent>
          </Select>
          <Button
            onClick={handleReassign}
            disabled={!selectedTech || isPending}
            className="w-full sm:w-auto"
          >
            {isPending ? "Đang gán..." : "Phân công"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
