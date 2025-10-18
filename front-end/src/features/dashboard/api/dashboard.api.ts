// src/features/dashboard/api/dashboard.api.ts
import apiClient from "@/lib/apiClient";
import { DashboardStats } from "@/features/dashboard/types";

export async function getDashboardStats(): Promise<DashboardStats> {
  return apiClient<DashboardStats>("/dashboard/stats");
}
