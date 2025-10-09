// src/features/user/hooks/useRoles.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRoles,
  getPermissions,
  addRole,
  updateRole,
  deleteRole,
  updateRolePermissions,
} from "@/features/user/apis/role.api";
import { Role, PermissionGroup } from "@/features/user/types";
import { useCrudMutations } from "@/hooks/useCrudMutations";
import { RoleFormValues } from "@/features/user/schemas";
import { toast } from "sonner";

const queryKey = ["roles"];

export const useRoles = () => {
  return useQuery<Role[]>({
    queryKey: queryKey,
    queryFn: getRoles,
  });
};

// Hook để lấy tất cả permissions
export const usePermissions = () => {
  return useQuery<PermissionGroup>({
    queryKey: ["permissions"],
    queryFn: getPermissions,
  });
};

// Hook cho các thao tác CRUD vai trò
export const useRoleMutations = () => {
  return useCrudMutations<Role, RoleFormValues, RoleFormValues>(
    queryKey,
    addRole,
    updateRole,
    deleteRole,
    {
      addSuccess: "Tạo vai trò thành công!",
      updateSuccess: "Cập nhật vai trò thành công!",
      deleteSuccess: "Đã xóa vai trò!",
    }
  );
};

// Hook riêng cho việc cập nhật permissions
export const useUpdateRolePermissions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateRolePermissions,
    onSuccess: (updatedRole) => {
      toast.success(`Đã cập nhật quyền cho vai trò "${updatedRole.name}".`);
      queryClient.invalidateQueries({ queryKey: queryKey });
      queryClient.invalidateQueries({
        queryKey: [...queryKey, updatedRole.id],
      }); // Invalidate chi tiết role
    },
    onError: (error) => {
      toast.error("Cập nhật quyền thất bại", { description: error.message });
    },
  });
};
