// src/features/user/hooks/useRoleManagement.ts
import { useResourceManagement } from "@/features/management-pages/hooks/useResourceManagement";
import { useRoles, useRoleMutations } from "./useRoles";
import { Role } from "../types";
import { RoleFormValues, roleFormSchema } from "../schemas";
import { addRole, updateRole, deleteRole } from "@/features/user/apis/role.api";

export function useRoleManagement() {
  return useResourceManagement<Role, RoleFormValues>({
    queryKey: ["roles"],
    useDataHook: useRoles,
    addFn: addRole,
    updateFn: updateRole,
    deleteFn: deleteRole,
    formSchema: roleFormSchema,
    defaultFormValues: {
      name: "",
      description: "",
    },
    getEditFormValues: (role) => ({
      name: role.name,
      description: role.description || "",
    }),
    customMessages: {
      addSuccess: "Tạo vai trò thành công!",
      updateSuccess: "Cập nhật vai trò thành công!",
      deleteSuccess: "Đã xóa vai trò!",
    },
  });
}
