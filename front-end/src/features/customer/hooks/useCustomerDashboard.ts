// src/features/customer/hooks/useCustomerDashboard.ts
import { useQuery } from "@tanstack/react-query";
import {
  getCustomerAppointments,
  getCustomerTreatmentPackages,
} from "@/features/customer/apis/customer-dashboard.api";
import { useAuth } from "@/contexts/AuthContexts";

const customerDashboardQueryKeys = {
  appointments: ["customer", "me", "appointments"],
  treatmentPackages: ["customer", "me", "treatmentPackages"],
};

export const useCustomerAppointments = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: customerDashboardQueryKeys.appointments,
    queryFn: getCustomerAppointments,
    enabled: !!user, // Chỉ fetch khi người dùng đã đăng nhập
  });
};

export const useCustomerTreatmentPackages = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: customerDashboardQueryKeys.treatmentPackages,
    queryFn: getCustomerTreatmentPackages,
    enabled: !!user, // Chỉ fetch khi người dùng đã đăng nhập
  });
};
