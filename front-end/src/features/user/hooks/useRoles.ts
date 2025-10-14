// src/features/user/hooks/useRoles.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRoles,
  getPermissions,
  addRole,
  updateRole,
  deleteRole,
  addPermissionToRole,
  removePermissionFromRole,
  getRoleById,
} from "@/features/user/apis/role.api";
import { Role, Permission, PermissionGroup } from "@/features/user/types";
import { useCrudMutations } from "@/features/management-pages/hooks/useCrudMutations";
import { RoleFormValues } from "@/features/user/schemas";
import { toast } from "sonner";

const queryKey = ["roles"];

export const useRoles = () => {
  return useQuery<Role[]>({
    queryKey: queryKey,
    queryFn: getRoles,
  });
};

// Lấy chi tiết một vai trò
export const useRoleById = (roleId: string) => {
  return useQuery<Role>({
    queryKey: [...queryKey, roleId],
    queryFn: () => getRoleById(roleId),
    enabled: !!roleId,
  });
};

// Hook để lấy tất cả permissions và nhóm chúng lại
export const usePermissions = () => {
  return useQuery<PermissionGroup>({
    queryKey: ["permissions"],
    queryFn: async () => {
      const permissions = await getPermissions();
      // Nhóm các quyền theo logic của bạn (ví dụ: theo tiền tố tên)
      const grouped: PermissionGroup = {};
      permissions.forEach((permission) => {
        const groupName = permission.name.split("_")[0] || "other";
        if (!grouped[groupName]) {
          grouped[groupName] = [];
        }
        grouped[groupName].push(permission);
      });
      return grouped;
    },
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

// cập nhật permissions
export const useUpdateRolePermissions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      roleId: string;
      newPermissionIds: string[];
      currentPermissions: Permission[];
    }) => {
      const { roleId, newPermissionIds, currentPermissions } = vars;
      const currentPermissionIds = new Set(currentPermissions.map((p) => p.id));
      const newPermissionIdsSet = new Set(newPermissionIds);

      // Tìm permissions để thêm
      const toAdd = newPermissionIds.filter(
        (id) => !currentPermissionIds.has(id)
      );
      // Tìm permissions để xóa
      const toRemove = [...currentPermissionIds].filter(
        (id) => !newPermissionIdsSet.has(id)
      );

      // Thực thi các API call song song
      const addPromises = toAdd.map((permissionId) =>
        addPermissionToRole({ roleId, permissionId })
      );
      const removePromises = toRemove.map((permissionId) =>
        removePermissionFromRole({ roleId, permissionId })
      );

      await Promise.all([...addPromises, ...removePromises]);
    },
    onSuccess: (_, vars) => {
      toast.success(`Đã cập nhật quyền cho vai trò.`);
      queryClient.invalidateQueries({ queryKey: queryKey });
      queryClient.invalidateQueries({
        queryKey: [...queryKey, vars.roleId],
      });
    },
    onError: (error) => {
      toast.error("Cập nhật quyền thất bại", { description: error.message });
    },
  });
};
