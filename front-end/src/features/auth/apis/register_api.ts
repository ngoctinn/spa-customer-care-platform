import { UserPublic } from "@/features/user/types";
import apiClient from "@/lib/apiClient";

export async function register(
  email: string,
  password: string
): Promise<UserPublic> {
  return apiClient<UserPublic>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}
