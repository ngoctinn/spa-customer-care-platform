// src/features/booking/hooks/useBookingProcess.ts
"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  customerInfoSchema,
  CustomerInfoValues,
  BookingState,
} from "@/features/booking/schemas";
import { useAppointmentById } from "@/features/appointment/hooks/useAppointments";
import { createAppointment, updateAppointment } from "@/features/appointment/apis/appointment.api";
import { TreatmentPackage } from "@/features/treatment/types";
import { useAuth } from "@/features/auth/contexts/AuthContexts";

export function useBookingProcess() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialServiceId = searchParams.get("serviceId") || undefined;
  const initialTreatmentIdParam = searchParams.get("treatmentId") || undefined;
  const purchasedServiceId = searchParams.get("purchasedServiceId") || undefined;
  const sessionId = searchParams.get("sessionId") || undefined;
  const rescheduleId = searchParams.get("rescheduleId") || undefined;

  const [step, setStep] = useState(1);
  const [bookingState, setBookingState] = useState<BookingState>({
    serviceId: initialServiceId,
    treatmentId: initialTreatmentIdParam,
    purchasedServiceId: purchasedServiceId,
    sessionId: sessionId,
    technicianIds: [],
  });
  const [isPending, startTransition] = useTransition();
  const [initialTreatmentId, setInitialTreatmentId] = useState(
    initialTreatmentIdParam
  );

  const { data: appointmentToReschedule, isLoading: isLoadingAppointment } = 
    useAppointmentById(rescheduleId!);

  const form = useForm<CustomerInfoValues>({
    resolver: zodResolver(customerInfoSchema),
    defaultValues: { name: "", phone: "", email: "", note: "" },
  });

  useEffect(() => {
    if (rescheduleId && appointmentToReschedule) {
      setBookingState((prev) => ({
        ...prev,
        serviceId: appointmentToReschedule.service_id,
        technicianIds: appointmentToReschedule.assigned_staff_ids || [],
        treatmentPackageId: appointmentToReschedule.treatment_package_id,
        sessionId: appointmentToReschedule.treatment_session_id,
        purchasedServiceId: undefined,
      }));
      setStep(2);
    } else if (initialTreatmentId) {
      setStep(1);
    } else if (initialServiceId) {
      setStep(2);
    } else {
      setStep(1);
    }
  }, [
    initialTreatmentId,
    initialServiceId,
    rescheduleId,
    appointmentToReschedule,
  ]);

  const handleNextStep = () => setStep((prev) => prev + 1);
  const handlePrevStep = () => setStep((prev) => prev - 1);

  const handleSelectService = (id: string, type: "service" | "treatment") => {
    if (type === "treatment") {
      setInitialTreatmentId(id);
      setBookingState((prev) => ({ ...prev, treatmentId: id }));
      return;
    }
    setBookingState((prev) => ({
      ...prev,
      serviceId: id,
      treatmentId: undefined,
    }));
    handleNextStep();
  };

  const handleSelectPackage = (pkg: TreatmentPackage) => {
    const session = pkg.sessions.find((s) => s.id === sessionId);
    if (!session) {
      toast.error("Không tìm thấy buổi hẹn hợp lệ trong gói.");
      return;
    }

    setBookingState((prev) => ({
      ...prev,
      serviceId: (session as any).service_id,
      treatmentPackageId: pkg.id,
      sessionId: session.id,
    }));
    setStep(2);
  };

  const handleSelectTechnician = (techIds: string[]) => {
    setBookingState((prev) => ({ ...prev, technicianIds: techIds }));
    handleNextStep();
  };

  const handleSelectTime = (date?: Date, time?: string) => {
    setBookingState((prev) => ({
      ...prev,
      selectedDate: date ?? prev.selectedDate,
      selectedTime: time ?? prev.selectedTime,
    }));
  };

  const handleCustomerInfoSubmit = (data: CustomerInfoValues) => {
    setBookingState((prev) => ({ ...prev, customerInfo: data }));
    handleNextStep();
  };

  const handleConfirmBooking = () => {
    startTransition(async () => {
      try {
        if (rescheduleId) {
          await updateAppointment(rescheduleId, bookingState);
          toast.success("Thay đổi lịch hẹn thành công!", {
            description: "Chúng tôi đã cập nhật thông tin lịch hẹn của bạn.",
          });
        } else {
          await createAppointment(bookingState);
          toast.success("Đặt lịch thành công!", {
            description:
              "Cảm ơn bạn đã tin tưởng. Chúng tôi sẽ sớm liên hệ để xác nhận.",
          });
        }
        router.push("/account/my-schedule");
      } catch (error) {
        toast.error("Thao tác thất bại", {
          description:
            error instanceof Error
              ? error.message
              : "Đã có lỗi không mong muốn.",
        });
      }
    });
  };

  return {
    step,
    bookingState,
    isPending,
    isLoadingAppointment,
    form,
    initialTreatmentId,
    rescheduleId,
    user,
    handleNextStep,
    handlePrevStep,
    handleSelectService,
    handleSelectPackage,
    handleSelectTechnician,
    handleSelectTime,
    handleCustomerInfoSubmit,
    handleConfirmBooking,
    setStep, // Expose setStep for special cases
  };
}
