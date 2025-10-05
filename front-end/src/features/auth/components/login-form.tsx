// src/features/auth/components/login-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import * as z from "zod";

import Link from "next/link";

import { PasswordInput } from "@/components/common/password-input";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardFooter,
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
import { useAuth } from "@/contexts/AuthContexts";
import { loginSchema } from "@/features/auth/schemas";

import { useTransition } from "react";

import { toast } from "sonner";

export const LoginForm = () => {
  const [isPending, startTransition] = useTransition();
  const { login } = useAuth();

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
        await login(values);
        toast.success("Đăng nhập thành công!", {
          description: "Chào mừng bạn đã quay trở lại.",
        });
      } catch (error) {
        console.error("Đăng nhập thất bại:", error);
        if (error instanceof Error) {
          toast.error("Đăng nhập thất bại", { description: error.message });
        } else {
          toast.error("Đăng nhập thất bại. Vui lòng thử lại.");
        }
      }
    });
  };

  const handleGoogleLogin = () => {
    // Logic xử lý đăng nhập bằng Google
    // test toast
    toast("Chức năng đăng nhập bằng Google đang được phát triển.");
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
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Quên mật khẩu?
                    </Link>
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
          </CardContent>
          <CardFooter className="flex flex-col gap-4 mt-4">
            <p className="text-sm text-muted-foreground text-center w-full">
              Chưa có tài khoản?{" "}
              <Link
                className="text-primary hover:underline font-medium"
                href="/auth/register"
              >
                Đăng ký tại đây
              </Link>
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
