// Tạo file mới: src/features/customer/hooks/useCustomerProfile.ts
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { FullCustomerProfile } from "@/features/customer/types";
import { useAuth } from "@/contexts/AuthContexts";

const getCustomerProfile = (): Promise<FullCustomerProfile> => {
  return apiClient("/customers/me"); // Giả sử có endpoint này
};

export const useCustomerProfile = () => {
  const { user } = useAuth();

  return useQuery<FullCustomerProfile>({
    queryKey: ["customerProfile", "me"],
    queryFn: () => getCustomerProfile(),
    enabled: !!user, // Chỉ chạy khi đã đăng nhập
  });
};
