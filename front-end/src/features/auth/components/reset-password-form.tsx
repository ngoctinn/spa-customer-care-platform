// src/features/auth/components/reset-password-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { resetPassword } from "@/features/auth/apis/password.api";
import { resetPasswordFormSchema } from "@/features/auth/schemas";

export const ResetPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<z.infer<typeof resetPasswordFormSchema>>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const onSubmit = (values: z.infer<typeof resetPasswordFormSchema>) => {
    if (!token) {
      toast.error("Đường dẫn không hợp lệ hoặc đã hết hạn.");
      return;
    }

    startTransition(async () => {
      try {
        await resetPassword({
          token,
          password: values.password,
        });

        toast.success("Thiết lập mật khẩu thành công!", {
          description: "Bây giờ bạn có thể đăng nhập với mật khẩu mới.",
        });

        setTimeout(() => {
          router.push("/auth/login");
        }, 1500);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Đã xảy ra lỗi không xác định. Vui lòng thử lại.";
        toast.error("Thao tác thất bại", { description: errorMessage });
      }
    });
  };

  if (!token) {
    return (
      <CardHeader className="text-center">
        <CardTitle>Yêu cầu không hợp lệ</CardTitle>
        <CardDescription>
          Đường dẫn này không hợp lệ hoặc đã hết hạn. Vui lòng thử lại hoặc yêu
          cầu một liên kết mới.
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
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Mật khẩu mới</FormLabel>
                  <FormControl>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...field}
                      disabled={isPending}
                      icon={
                        fieldState.error ? (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        ) : showPassword ? (
                          <EyeOff
                            className="h-4 w-4 text-muted-foreground"
                            onClick={() => setShowPassword(false)}
                          />
                        ) : (
                          <Eye
                            className="h-4 w-4 text-muted-foreground"
                            onClick={() => setShowPassword(true)}
                          />
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                  <FormControl>
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...field}
                      disabled={isPending}
                      icon={
                        fieldState.error ? (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        ) : showConfirmPassword ? (
                          <EyeOff
                            className="h-4 w-4 text-muted-foreground"
                            onClick={() => setShowConfirmPassword(false)}
                          />
                        ) : (
                          <Eye
                            className="h-4 w-4 text-muted-foreground"
                            onClick={() => setShowConfirmPassword(true)}
                          />
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? "Đang xử lý..." : "Xác nhận"}
            </Button>
          </CardContent>
        </form>
      </Form>
    </>
  );
};
