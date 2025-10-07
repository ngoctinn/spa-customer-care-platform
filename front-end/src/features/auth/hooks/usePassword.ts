// src/features/auth/hooks/usePassword.ts
import { useMutation } from "@tanstack/react-query";
import { changePassword } from "@/features/auth/apis/password.api";
import { ChangePasswordFormValues } from "@/features/auth/schemas";
import { toast } from "sonner";

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordFormValues) => changePassword(data),
    onSuccess: () => {
      toast.success("Đổi mật khẩu thành công!");
    },
    onError: (error) => {
      toast.error("Đổi mật khẩu thất bại", { description: error.message });
    },
  });
};
