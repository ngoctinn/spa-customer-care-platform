// src/features/dashboard/hooks/useDashboardStats.ts
import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/features/dashboard/api/dashboard.api";
import { DashboardStats } from "@/features/dashboard/types";

export const useDashboardStats = () => {
  return useQuery<DashboardStats>({
    queryKey: ["dashboardStats"],
    queryFn: getDashboardStats,
  });
};
