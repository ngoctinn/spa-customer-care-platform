// src/features/auth/components/reset-password-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

import { resetPasswordFormSchema } from "@/features/auth/schemas";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/shared/password-input";

export const ResetPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof resetPasswordFormSchema>>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: z.infer<typeof resetPasswordFormSchema>) => {
    if (!token) {
      toast.error("Đường dẫn không hợp lệ hoặc đã hết hạn.");
      console.error("Không tìm thấy token trong URL.");
      return;
    }

    startTransition(async () => {
      try {
        // Gửi token và mật khẩu mới đến backend
        // const data = await resetPassword({
        //   token,
        //   password: values.password,
        // });
        toast.success("Đặt lại mật khẩu thành công!", {
          description: "Bạn sẽ được chuyển đến trang đăng nhập.",
        });
        //console.log("Đặt lại mật khẩu thành công:", data);
        setTimeout(() => {
          router.push("/auth/login");
        }, 1500);
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message);
          console.error("Lỗi đặt lại mật khẩu:", error.message);
        } else {
          toast.error("Đã xảy ra lỗi không xác định. Vui lòng thử lại.");
          console.error("Lỗi không xác định:", error);
        }
      }
      console.log(values);
    });
  };

  // Nếu không có token, hiển thị thông báo lỗi
  if (!token) {
    return (
      <CardHeader className="text-center">
        <CardTitle>Yêu cầu không hợp lệ</CardTitle>
        <CardDescription>
          Đường dẫn đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu
          cầu lại từ trang quên mật khẩu.
        </CardDescription>
      </CardHeader>
    );
  }

  return (
    <>
      <CardHeader className="text-center">
        <CardTitle>Đặt lại mật khẩu</CardTitle>
        <CardDescription>
          Nhập mật khẩu mới cho tài khoản <strong>{email}</strong>
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu mới</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="••••••••"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="••••••••"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Đang xử lý..." : "Xác nhận"}
            </Button>
          </CardContent>
        </form>
      </Form>
    </>
  );
};
