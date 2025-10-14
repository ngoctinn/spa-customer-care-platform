import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FullCustomerProfile } from "@/features/customer/types";
import { useAuth } from "@/features/auth/contexts/AuthContexts";
import {
  updateCustomerProfile,
  getCustomerProfile, // Import hàm mới
} from "@/features/customer/api/customer.api";
import { toast } from "sonner";

const queryKey = ["customerProfile", "me"];

export const useCustomerProfile = () => {
  const { user } = useAuth(); // Lấy user từ AuthContext
  return useQuery<FullCustomerProfile>({
    queryKey: queryKey,
    queryFn: getCustomerProfile,
    enabled: !!user,
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
