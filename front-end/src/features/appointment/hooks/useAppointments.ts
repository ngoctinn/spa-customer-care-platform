// src/features/appointment/hooks/useAppointments.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAppointments,
  createAppointmentAdmin,
  updateAppointment,
  deleteAppointment,
  getAppointmentById,
  getUpcomingAppointmentsByTechnician,
  getSuggestedTechniciansForAppointment,
} from "@/features/appointment/apis/appointment.api";
import { Appointment } from "@/features/appointment/types";
import { toast } from "sonner";
import { AppointmentFormValues } from "@/features/appointment/schemas";
import { FullStaffProfile } from "@/features/staff/types";

const queryKey = ["appointments"];

// Hook để lấy danh sách lịch hẹn
export const useAppointments = () => {
  return useQuery<Appointment[]>({
    queryKey: queryKey,
    queryFn: getAppointments,
  });
};

/**
 * ++ HOOK MỚI: Lấy chi tiết lịch hẹn bằng ID. ++
 * @param appointmentId ID của lịch hẹn
 */
export const useAppointmentById = (appointmentId: string) => {
  return useQuery<Appointment>({
    queryKey: ["appointments", appointmentId],
    queryFn: () => getAppointmentById(appointmentId),
    enabled: !!appointmentId,
  });
};

// Hook để admin thêm lịch hẹn mới
export const useAddAppointmentAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (appointmentData: AppointmentFormValues) =>
      createAppointmentAdmin(appointmentData),
    onSuccess: () => {
      toast.success("Tạo lịch hẹn thành công!");
      queryClient.invalidateQueries({ queryKey: queryKey });
    },
    onError: (error) => {
      toast.error("Tạo lịch hẹn thất bại", { description: error.message });
    },
  });
};

// Hook để cập nhật lịch hẹn
export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Appointment | AppointmentFormValues>;
    }) => updateAppointment(id, data),
    onSuccess: () => {
      toast.success("Cập nhật lịch hẹn thành công!");
      queryClient.invalidateQueries({ queryKey: queryKey });
    },
    onError: (error) => {
      toast.error("Cập nhật thất bại", { description: error.message });
    },
  });
};

// Hook để xóa/hủy lịch hẹn
export const useDeleteAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAppointment,
    onSuccess: () => {
      toast.success("Đã hủy lịch hẹn!");
      queryClient.invalidateQueries({ queryKey: queryKey });
    },
    onError: (error) => {
      toast.error("Hủy lịch hẹn thất bại", { description: error.message });
    },
  });
};

/**
 * Hook để lấy danh sách lịch hẹn sắp tới của một nhân viên.
 * @param technicianId ID của nhân viên.
 */
export const useUpcomingAppointmentsByTechnician = (technicianId?: string) => {
  return useQuery<Appointment[]>({
    queryKey: ["appointments", "upcoming", technicianId],
    queryFn: () => getUpcomingAppointmentsByTechnician(technicianId!),
    enabled: !!technicianId,
  });
};

/**
 * Hook để lấy danh sách nhân viên thay thế được gợi ý.
 * @param appointmentId ID của lịch hẹn.
 */
export const useSuggestedTechnicians = (appointmentId?: string) => {
  return useQuery<FullStaffProfile[]>({
    queryKey: ["suggestedTechnicians", appointmentId],
    queryFn: () => getSuggestedTechniciansForAppointment(appointmentId!),
    enabled: !!appointmentId,
  });
};
