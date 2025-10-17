import { useResourceManagement } from "@/features/management-pages/hooks/useResourceManagement";
import { useStaff } from "./useStaff";
import { FullStaffProfile } from "../types";
import { StaffFormValues, staffFormSchema } from "../schemas";
import { updateStaff, initiateOffboarding } from "../api/staff.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useStaffManagement() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Sử dụng lại hook quản lý tài nguyên chung cho các hành động CRUD cơ bản
  const resourceManagement = useResourceManagement<
    FullStaffProfile,
    StaffFormValues
  >({
    queryKey: ["staffList"],
    useDataHook: useStaff,
    // Hàm add được xử lý bởi wizard riêng, nên ta truyền một hàm giả
    addFn: async () => Promise.resolve({} as FullStaffProfile),
    updateFn: (vars: { id: string; data: Partial<StaffFormValues> }) =>
      updateStaff({ staffId: vars.id, staffData: vars.data }),
    // Hàm delete sẽ được thay thế bằng luồng off-board mới
    deleteFn: async () => Promise.resolve(),
    formSchema: staffFormSchema,
    defaultFormValues: {
      phone_number: "",
      position: "",
      employment_status: "active",
      notes: "",
    },
    getEditFormValues: (staff) => ({
      phone_number: staff.phone_number || "",
      position: staff.position || "",
      hire_date: staff.hire_date ? new Date(staff.hire_date) : undefined,
      employment_status: staff.employment_status,
      notes: staff.notes || "",
    }),
    customMessages: {
      updateSuccess: "Cập nhật thông tin nhân viên thành công!",
      deleteSuccess: "Đã bắt đầu quy trình cho nghỉ việc!",
      deleteError: "Thao tác thất bại.",
    },
  });

  // Mutation để bắt đầu quy trình off-boarding
  const initiateOffboardingMutation = useMutation({
    mutationFn: initiateOffboarding,
    onSuccess: (data, staffId) => {
      resourceManagement.handleCloseDeleteDialog();
      // Chuyển trạng thái nhân viên thành PENDING_OFFBOARDING
      queryClient.invalidateQueries({ queryKey: ["staffList"] });
      toast.info("Bắt đầu quy trình cho nghỉ việc.");

      if (
        data.cancelled_schedules_count &&
        data.cancelled_schedules_count > 0
      ) {
        toast.info(
          `Đã tự động hủy ${data.cancelled_schedules_count} ca làm việc đã đăng ký của nhân viên này.`
        );
      }

      if (data.reassignment_required) {
        toast.info(
          `Nhân viên có ${data.upcoming_appointments_count} lịch hẹn cần phân công lại.`
        );
        // Chuyển hướng đến trang phân công lại
        router.push(`/dashboard/staffs/${staffId}/reassign`);
      } else {
        toast.success(
          data.message || "Nhân viên không có lịch hẹn nào cần xử lý."
        );
        // Có thể gọi API hoàn tất luôn ở đây nếu muốn, hoặc để user tự vào trang reassign và bấm nút
        router.push(`/dashboard/staffs/${staffId}/reassign`);
      }
    },
    onError: (error) => {
      toast.error("Thao tác thất bại", { description: error.message });
    },
  });

  // Ghi đè hàm xử lý "xóa" mặc định
  const handleConfirmOffboard = () => {
    if (resourceManagement.itemToDelete) {
      initiateOffboardingMutation.mutate(resourceManagement.itemToDelete.id);
    }
  };

  return {
    ...resourceManagement,
    // Ghi đè hàm và cung cấp trạng thái mới
    handleConfirmDelete: handleConfirmOffboard,
    isSubmitting:
      resourceManagement.isSubmitting || initiateOffboardingMutation.isPending,
  };
}
