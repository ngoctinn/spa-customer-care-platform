import apiClient from "@/lib/apiClient";
import { Permission, PermissionGroup, Role } from "@/features/user/types";
import { RoleFormValues } from "@/features/user/schemas";

//Lấy danh sách tất cả vai trò
export async function getRoles(): Promise<Role[]> {
  return apiClient<Role[]>("/admin/roles");
}

// Lấy chi tiết một vai trò bằng ID
export async function getRoleById(roleId: string): Promise<Role> {
  return apiClient<Role>(`/admin/roles/${roleId}`);
}

//Lấy danh sách tất cả quyền hạn
export async function getPermissions(): Promise<Permission[]> {
  // API trả về một mảng phẳng, việc nhóm lại sẽ được xử lý ở client
  return apiClient<Permission[]>("/admin/permissions");
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

/**
 * CẬP NHẬT: Gán một quyền cho một vai trò.
 * API này thêm một permission vào role, thay vì thay thế toàn bộ.
 * @param roleId ID của vai trò
 * @param permissionId ID của quyền cần gán
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
 * CẬP NHẬT: Xóa một quyền khỏi một vai trò.
 * @param roleId ID của vai trò
 * @param permissionId ID của quyền cần xóa
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

// Các hàm gán/xóa vai trò cho người dùng (nếu cần)
export async function assignRoleToUser(
  userId: string,
  roleId: string
): Promise<any> {
  return apiClient(`/admin/users/${userId}/roles`, {
    method: "POST",
    body: JSON.stringify({ role_id: roleId }),
  });
}

export async function removeRoleFromUser(
  userId: string,
  roleId: string
): Promise<any> {
  return apiClient(`/admin/users/${userId}/roles/${roleId}`, {
    method: "DELETE",
  });
}
