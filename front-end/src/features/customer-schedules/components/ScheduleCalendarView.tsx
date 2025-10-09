// src/features/customer-schedules/components/ScheduleCalendarView.tsx
"use client";

import { useState } from "react";

// --- IMPORT ĐÃ REFACTOR ---
import { Appointment } from "@/features/appointment/types";
import { ScheduleDataProps } from "@/features/customer-schedules/types";
import InteractiveCalendar from "@/features/customer-schedules/components/InteractiveCalendar";
import AppointmentCard from "@/features/customer-schedules/components/AppointmentCard";
import ActionRequiredList from "@/features/customer-schedules/components/ActionRequiredList";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSchedule } from "@/features/customer-schedules/contexts/ScheduleContext";

interface ScheduleCalendarViewProps {
  onCancelAppointment: (id: string, reason: string) => void;
  onWriteReview: (appointment: Appointment) => void;
  onCreateAppointment: (date: Date) => void;
}

export default function ScheduleCalendarView(props: ScheduleCalendarViewProps) {
  const { appointments, services, staff, reviews, treatments, treatmentPlans } =
    useSchedule();

  const { onCancelAppointment, onWriteReview, onCreateAppointment } = props;
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  // --- LOGIC ĐÃ REFACTOR ---
  // Lấy thông tin chi tiết cho lịch hẹn được chọn
  const selectedService = services.find(
    (s) => s.id === selectedAppointment?.service_id
  );
  const selectedTechnician = staff.find(
    (t) => t.id === selectedAppointment?.technician_id
  );
  const hasReviewed = selectedAppointment
    ? reviews.some((r) => r.appointment_id === selectedAppointment.id)
    : false;
  const treatmentPackage = selectedAppointment?.treatment_package_id
    ? treatments.find(
        (pkg) => pkg.id === selectedAppointment.treatment_package_id
      )
    : undefined;
  const treatmentPlan = treatmentPackage
    ? treatmentPlans.find(
        (plan) => plan.id === treatmentPackage.treatment_plan_id
      )
    : undefined;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full flex-grow">
      {/* Cột trái: Danh sách cần hành động */}
      <div className="lg:block bg-card p-4 rounded-lg border flex flex-col">
        <h3 className="text-lg font-semibold mb-4">Đã mua - Cần đặt lịch</h3>
        <ActionRequiredList />
      </div>

      {/* Cột phải: Lịch */}
      <div className="h-full flex flex-col">
        <div className="flex-grow">
          <InteractiveCalendar
            appointments={appointments}
            services={services}
            onSelectAppointment={setSelectedAppointment}
            onCreateAppointment={onCreateAppointment}
          />
        </div>
      </div>

      {/* Dialog hiển thị chi tiết lịch hẹn */}
      <Dialog
        open={!!selectedAppointment}
        onOpenChange={(isOpen) => !isOpen && setSelectedAppointment(null)}
      >
        <DialogContent className="w-[95vw] max-w-[420px] sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle>Chi tiết lịch hẹn</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh] pr-4">
            {selectedAppointment && selectedService && (
              <AppointmentCard
                appointment={selectedAppointment}
                service={selectedService}
                technician={selectedTechnician}
                treatmentPackage={treatmentPackage}
                treatmentPlan={treatmentPlan}
                onCancel={(id, reason) => onCancelAppointment(id, reason)}
                onReview={onWriteReview}
                hasReviewed={hasReviewed}
              />
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
