// src/features/user/apis/role.api.ts
import apiClient from "@/lib/apiClient";
import { Permission, Role } from "@/features/user/types";
import { RoleFormValues } from "@/features/user/schemas";

/**
 * Lấy danh sách tất cả vai trò.
 */
export async function getRoles(): Promise<Role[]> {
  return apiClient<Role[]>("/admin/roles");
}

/**
 * Lấy chi tiết một vai trò bằng ID.
 */
export async function getRoleById(roleId: string): Promise<Role> {
  return apiClient<Role>(`/admin/roles/${roleId}`);
}

/**
 * Lấy danh sách tất cả các quyền hạn.
 */
export async function getPermissions(): Promise<Permission[]> {
  return apiClient<Permission[]>("/admin/permissions");
}

/**
 * Tạo vai trò mới.
 */
export async function addRole(roleData: RoleFormValues): Promise<Role> {
  return apiClient<Role>("/admin/roles", {
    method: "POST",
    body: JSON.stringify(roleData),
  });
}

/**
 * Cập nhật một vai trò.
 */
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

/**
 * Xóa một vai trò.
 */
export async function deleteRole(id: string): Promise<void> {
  return apiClient<void>(`/admin/roles/${id}`, {
    method: "DELETE",
  });
}

/**
 * Gán một quyền cho một vai trò.
 */
export async function addPermissionToRole({
  roleId,
  permissionId,
}: {
  roleId: string;
  permissionId: string;
}): Promise<Role> {
  return apiClient<Role>(`/admin/roles/${roleId}/permissions`, {
    method: "POST",
    body: JSON.stringify({ permission_id: permissionId }),
  });
}

/**
 * Xóa một quyền khỏi một vai trò.
 */
export async function removePermissionFromRole({
  roleId,
  permissionId,
}: {
  roleId: string;
  permissionId: string;
}): Promise<Role> {
  return apiClient<Role>(`/admin/roles/${roleId}/permissions/${permissionId}`, {
    method: "DELETE",
  });
}

/**
 * Gán một vai trò cho người dùng.
 */
export async function assignRoleToUser(
  userId: string,
  roleId: string
): Promise<any> {
  return apiClient(`/admin/users/${userId}/roles`, {
    method: "POST",
    body: JSON.stringify({ role_id: roleId }),
  });
}

/**
 * Xóa một vai trò khỏi người dùng.
 */
export async function removeRoleFromUser(
  userId: string,
  roleId: string
): Promise<any> {
  return apiClient(`/admin/users/${userId}/roles/${roleId}`, {
    method: "DELETE",
  });
}
