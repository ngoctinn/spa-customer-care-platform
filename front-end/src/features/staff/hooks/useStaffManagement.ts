// src/features/staff/hooks/useStaffManagement.ts
import { useResourceManagement } from "@/features/management-pages/hooks/useResourceManagement";
import { useStaff } from "./useStaff";
import { FullStaffProfile } from "../types";
import { StaffFormValues, staffFormSchema } from "../schemas";
import { updateStaff, offboardStaff } from "../api/staff.api";

export function useStaffManagement() {
  return useResourceManagement<FullStaffProfile, StaffFormValues>({
    queryKey: ["staffList"],
    useDataHook: useStaff,
    // Add is handled by a separate wizard, so we pass a dummy function
    addFn: async () => Promise.resolve({} as FullStaffProfile),
    updateFn: (vars: { id: string; data: Partial<StaffFormValues> }) =>
      updateStaff({ staffId: vars.id, staffData: vars.data }),
    deleteFn: offboardStaff, // Use offboardStaff for deletion
    formSchema: staffFormSchema,
    defaultFormValues: {
      phone_number: "",
      position: "",
      employment_status: "active",
      notes: "",
    },
    getEditFormValues: (staff) => ({
      // Map the full profile to the form values for editing
      phone_number: staff.phone_number || "",
      position: staff.position || "",
      hire_date: staff.hire_date ? new Date(staff.hire_date) : undefined,
      employment_status: staff.employment_status,
      notes: staff.notes || "",
    }),
    customMessages: {
      updateSuccess: "Cập nhật thông tin nhân viên thành công!",
      deleteSuccess: "Đã cho nhân viên nghỉ việc!",
      deleteError: "Thao tác cho nghỉ việc thất bại.",
    },
  });
}
