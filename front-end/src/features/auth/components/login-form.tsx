// src/features/auth/components/login-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FcGoogle } from "react-icons/fc";

import { loginSchema } from "@/features/auth/schemas";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
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

import { useState, useTransition } from "react";

import { login, fetchProfile } from "@/features/auth/apis/auth_api";

import { toast } from "sonner";

export const LoginForm = () => {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    startTransition(async () => {
      // Logic xử lý đăng nhập ở đây
      try {
        const data = await login(values.email, values.password);
        console.log("Đăng nhập thành công:", data);
        toast.success("Đăng nhập thành công!", data);
      } catch (error) {
        console.error("Đăng nhập thất bại:", error);
        toast.error("Đăng nhập thất bại. Vui lòng thử lại.");
      }
      console.log(values);
    });
  };

  const handleGoogleLogin = () => {
    // Logic xử lý đăng nhập bằng Google
    // test toast
    toast("Chức năng đăng nhập bằng Google đang được phát triển.");
  };

  const handleShowProfile = () => {
    startTransition(async () => {
      try {
        const profile = await fetchProfile();
        console.log("Thông tin người dùng:", profile);
        alert(`Xin chào, ${profile.full_name || profile.email}`);
      } catch (error: unknown) {
        console.error("Lỗi khi lấy thông tin:", error);
        alert((error as Error).message);
      }
    });
  };

  return (
    <>
      <CardHeader className="text-center">
        <CardTitle>Đăng nhập</CardTitle>
        <CardDescription>
          Nhập thông tin để truy cập vào tài khoản của bạn.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="email@example.com"
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Mật khẩu</FormLabel>
                    <a
                      href="/auth/forgot-password"
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Quên mật khẩu?
                    </a>
                  </div>
                  <FormControl>
                    <PasswordInput
                      placeholder="••••••••"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Đang xử lý..." : "Đăng Nhập"}
            </Button>
            {/* Thêm 1 nút để test hiển thị thông tin người dùng */}
            <Button
              type="button"
              className="w-full"
              onClick={handleShowProfile}
              disabled={isPending}
            >
              Hiển thị thông tin người dùng (Sau khi đăng nhập)
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 mt-4">
            <p className="text-sm text-muted-foreground text-center w-full">
              Chưa có tài khoản?{" "}
              <a
                className="text-primary hover:underline font-medium"
                href="/auth/register"
              >
                Đăng ký tại đây
              </a>
            </p>
          </CardFooter>
        </form>
      </Form>
      <CardContent className="pt-0">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Hoặc tiếp tục với
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full mt-4"
          type="button"
          onClick={handleGoogleLogin}
          disabled={isPending}
        >
          <FcGoogle className="size-5 mr-2" aria-hidden="true" />
          Google
        </Button>
      </CardContent>
    </>
  );
};
