import apiClient from "@/lib/apiClient";
import { PermissionGroup, Role } from "@/features/user/types";
import { RoleFormValues } from "@/features/user/schemas";

export async function getRoles(): Promise<Role[]> {
  return apiClient<Role[]>("/admin/roles");
}
// Lấy danh sách tất cả quyền hạn đã được nhóm lại
export async function getPermissions(): Promise<PermissionGroup> {
  return apiClient<PermissionGroup>("/admin/permissions");
}

// Tạo vai trò mới
export async function addRole(roleData: RoleFormValues): Promise<Role> {
  return apiClient<Role>("/admin/roles", {
    method: "POST",
    body: JSON.stringify(roleData),
  });
}

// Cập nhật vai trò
export async function updateRole({
  id,
  data,
}: {
  id: string;
  data: RoleFormValues;
}): Promise<Role> {
  return apiClient<Role>(`/admin/roles/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Xóa vai trò
export async function deleteRole(id: string): Promise<void> {
  return apiClient<void>(`/admin/roles/${id}`, {
    method: "DELETE",
  });
}

// Cập nhật quyền cho vai trò
export async function updateRolePermissions({
  roleId,
  permissionIds,
}: {
  roleId: string;
  permissionIds: string[];
}): Promise<Role> {
  return apiClient<Role>(`/admin/roles/${roleId}/permissions`, {
    method: "PUT",
    body: JSON.stringify({ permissionIds }),
  });
}
