// src/features/appointment/hooks/useAppointmentModals.ts
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  appointmentFormSchema,
  AppointmentFormValues,
} from "@/features/appointment/schemas";
import { Appointment } from "@/features/appointment/types";
import {
  useAddAppointmentAdmin,
  useUpdateAppointment,
} from "./useAppointments";
import { toast } from "sonner";

export function useAppointmentModals() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [actionToConfirm, setActionToConfirm] = useState<{
    type: "check-in" | "cancel";
    appointmentId: string;
  } | null>(null);

  const addAppointmentMutation = useAddAppointmentAdmin();
  const updateAppointmentMutation = useUpdateAppointment();

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
  });

  const handleOpenForm = (
    appointment?: Appointment | null,
    initialDate?: Date
  ) => {
    if (appointment) {
      setEditingAppointment(appointment);
      form.reset({
        customer_id: appointment.customer_id,
        service_id: appointment.service_id,
        assigned_staff_ids: appointment.assigned_staff_ids,
        start_time: new Date(appointment.start_time),
        customer_note: appointment.customer_note || "",
      });
    } else {
      setEditingAppointment(null);
      form.reset({ start_time: initialDate });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => setIsFormOpen(false);

  // Tái cấu trúc: Loại bỏ `any` và sử dụng logic điều kiện
  const handleFormSubmit = (data: AppointmentFormValues) => {
    const onSuccess = () => handleCloseForm();

    if (editingAppointment) {
      updateAppointmentMutation.mutate(
        { id: editingAppointment.id, data },
        { onSuccess }
      );
    } else {
      addAppointmentMutation.mutate(data, { onSuccess });
    }
  };

  const handleOpenDetail = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => setIsDetailOpen(false);

  const handleOpenConfirmDialog = (
    type: "check-in" | "cancel",
    appointmentId: string
  ) => {
    setActionToConfirm({ type, appointmentId });
  };

  const handleCloseConfirmDialog = () => setActionToConfirm(null);

  const handleConfirmAction = () => {
    if (!actionToConfirm) return;
    const { type, appointmentId } = actionToConfirm;
    const newStatus = type === "check-in" ? "checked-in" : "cancelled";

    updateAppointmentMutation.mutate(
      { id: appointmentId, data: { status: newStatus } },
      {
        onSuccess: () => {
          toast.success(
            `Đã ${
              type === "check-in" ? "check-in" : "hủy"
            } lịch hẹn thành công.`
          );
          handleCloseDetail();
          handleCloseConfirmDialog();
        },
      }
    );
  };

  return {
    form,
    isFormOpen,
    editingAppointment,
    isSubmitting:
      addAppointmentMutation.isPending || updateAppointmentMutation.isPending,
    handleOpenForm,
    handleCloseForm,
    handleFormSubmit,
    isDetailOpen,
    selectedAppointment,
    handleOpenDetail,
    handleCloseDetail,
    actionToConfirm,
    handleOpenConfirmDialog,
    handleCloseConfirmDialog,
    handleConfirmAction,
  };
}
