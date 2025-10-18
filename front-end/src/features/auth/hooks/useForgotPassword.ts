// src/features/auth/hooks/useForgotPassword.ts
import { useMutation } from "@tanstack/react-query";
import { forgotPassword } from "@/features/auth/apis/password.api";
import { toast } from "sonner";

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email: string) => forgotPassword(email),
    onSuccess: (data) => {
      toast.success("Yêu cầu đã được gửi đi!", {
        description: data.message,
      });
    },
    onError: (error) => {
      toast.error("Gửi yêu cầu thất bại", { description: error.message });
    },
  });
};
