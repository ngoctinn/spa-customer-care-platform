// Tạo file mới: src/features/customer/hooks/useCustomerProfile.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { FullCustomerProfile } from "@/features/customer/types";
import { useAuth } from "@/features/auth/contexts/AuthContexts";
import { updateCustomerProfile } from "@/features/customer/api/customer.api";
import { toast } from "sonner";

const queryKey = ["customerProfile", "me"];

const getCustomerProfile = (): Promise<FullCustomerProfile> => {
  return apiClient("/customers/me"); // Giả sử có endpoint này
};

export const useCustomerProfile = () => {
  return useQuery<FullCustomerProfile>({
    queryKey: ["customerProfile", "me"],
    queryFn: getCustomerProfile,
    enabled: !!useAuth().user, // Chỉ chạy khi đã đăng nhập
  });
};

export const useUpdateCustomerProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCustomerProfile,
    onSuccess: () => {
      toast.success("Cập nhật thông tin thành công!");
      queryClient.invalidateQueries({ queryKey: queryKey });
    },
    onError: (error) => {
      toast.error("Cập nhật thất bại", { description: error.message });
    },
  });
};
