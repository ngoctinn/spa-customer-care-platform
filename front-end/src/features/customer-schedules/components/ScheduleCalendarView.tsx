// src/features/customer-schedules/components/ScheduleCalendarView.tsx
"use client";

import { useState, useMemo } from "react";

import { Appointment } from "@/features/appointment/types";
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

  const servicesMap = useMemo(
    () => new Map(services.map((s) => [s.id, s])),
    [services]
  );
  const staffMap = useMemo(() => new Map(staff.map((t) => [t.id, t])), [staff]);
  const reviewsMap = useMemo(() => {
    const map = new Map<string, boolean>();
    reviews.forEach((r) => map.set(r.appointment_id, true));
    return map;
  }, [reviews]);
  const treatmentsMap = useMemo(
    () => new Map(treatments.map((p) => [p.id, p])),
    [treatments]
  );
  const treatmentPlansMap = useMemo(
    () => new Map(treatmentPlans.map((p) => [p.id, p])),
    [treatmentPlans]
  );

  const selectedService = useMemo(() => {
    if (!selectedAppointment) return undefined;
    return servicesMap.get(selectedAppointment.service_id);
  }, [servicesMap, selectedAppointment]);

  const selectedTechnician = useMemo(() => {
    if (!selectedAppointment?.assigned_staff_ids?.[0]) return undefined;
    return staffMap.get(selectedAppointment.assigned_staff_ids[0]);
  }, [staffMap, selectedAppointment]);

  const hasReviewed = useMemo(() => {
    if (!selectedAppointment) return false;
    return reviewsMap.has(selectedAppointment.id);
  }, [reviewsMap, selectedAppointment]);

  const treatmentPackage = useMemo(() => {
    if (!selectedAppointment?.treatment_package_id) return undefined;
    return treatmentsMap.get(selectedAppointment.treatment_package_id);
  }, [treatmentsMap, selectedAppointment]);

  const treatmentPlan = useMemo(() => {
    if (!treatmentPackage) return undefined;
    return treatmentPlansMap.get(treatmentPackage.treatment_plan_id);
  }, [treatmentPlansMap, treatmentPackage]);

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
