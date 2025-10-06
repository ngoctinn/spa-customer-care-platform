// src/features/appointment/hooks/useAppointments.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAppointments,
  createAppointmentAdmin,
  updateAppointment,
  deleteAppointment,
} from "@/features/appointment/apis/appointment.api";
import { Appointment } from "@/features/appointment/types";
import { toast } from "sonner";
import { AppointmentFormValues } from "@/features/appointment/schemas";
import { getErrorMessage } from "@/lib/get-error-message";

const appointmentsQueryKeys = {
  all: ["appointments"] as const,
};

type UpdateAppointmentVariables = {
  id: string;
  data: Parameters<typeof updateAppointment>[1];
};

// Hook để lấy danh sách lịch hẹn
export const useAppointments = () => {
  return useQuery<Appointment[]>({
    queryKey: appointmentsQueryKeys.all,
    queryFn: getAppointments,
  });
};

// Hook để admin thêm lịch hẹn mới
export const useAddAppointmentAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation<Appointment, unknown, AppointmentFormValues>({
    mutationFn: (appointmentData) => createAppointmentAdmin(appointmentData),
    onSuccess: async () => {
      toast.success("Tạo lịch hẹn thành công!");
      await queryClient.invalidateQueries({ queryKey: appointmentsQueryKeys.all });
    },
    onError: (error) => {
      toast.error("Tạo lịch hẹn thất bại", {
        description: getErrorMessage(error),
      });
    },
  });
};

// Hook để cập nhật lịch hẹn
export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation<Appointment, unknown, UpdateAppointmentVariables>({
    mutationFn: ({ id, data }) => updateAppointment(id, data),
    onSuccess: async () => {
      toast.success("Cập nhật lịch hẹn thành công!");
      await queryClient.invalidateQueries({ queryKey: appointmentsQueryKeys.all });
    },
    onError: (error) => {
      toast.error("Cập nhật thất bại", {
        description: getErrorMessage(error),
      });
    },
  });
};

// Hook để xóa/hủy lịch hẹn
export const useDeleteAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, string>({
    mutationFn: (appointmentId) => deleteAppointment(appointmentId),
    onSuccess: async () => {
      toast.success("Đã hủy lịch hẹn!");
      await queryClient.invalidateQueries({ queryKey: appointmentsQueryKeys.all });
    },
    onError: (error) => {
      toast.error("Hủy lịch hẹn thất bại", {
        description: getErrorMessage(error),
      });
    },
  });
};
