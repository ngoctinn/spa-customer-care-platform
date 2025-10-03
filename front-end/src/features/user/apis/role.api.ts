import apiClient from "@/lib/apiClient";
import { Role } from "@/features/user/types";

export async function getRoles(): Promise<Role[]> {
  return apiClient<Role[]>("/admin/roles");
}
