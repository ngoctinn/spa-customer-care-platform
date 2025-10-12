// src/features/auth/components/login-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react"; // <--- Thêm icons
import Link from "next/link";
import { useSearchParams } from "next/navigation"; // <--- Import useSearchParams
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import * as z from "zod";

import { PasswordInput } from "@/components/common/password-input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // <--- Import Alert
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
import { Spinner } from "@/components/ui/spinner"; // <--- Import Spinner (giả sử bạn đã có)
import { useAuth } from "@/features/auth/contexts/AuthContexts";
import { loginSchema } from "@/features/auth/schemas";

export const LoginForm = () => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const searchParams = useSearchParams();

  // Xử lý lỗi từ redirect của Google OAuth
  useEffect(() => {
    const googleError = searchParams.get("error");
    if (googleError) {
      setError("Đăng nhập với Google thất bại. Vui lòng thử lại.");
      // Có thể thay thế bằng toast nếu muốn
      // toast.error("Đăng nhập với Google thất bại", { description: "Vui lòng thử lại." });
    }
  }, [searchParams]);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    setError(null); // Xóa lỗi cũ khi submit lại
    startTransition(async () => {
      try {
        await login(values);
        toast.success("Đăng nhập thành công!", {
          description: "Chào mừng bạn đã quay trở lại.",
        });
        // Chuyển hướng sẽ được xử lý trong AuthContext
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Đã xảy ra lỗi không xác định. Vui lòng thử lại.");
        }
      }
    });
  };

  const handleGoogleLogin = () => {
    // Chuyển hướng đến backend để xử lý OAuth
    // Đảm bảo NEXT_PUBLIC_API_URL được cấu hình trong .env.local
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    window.location.href = `${apiUrl}/auth/login/google`;
  };

  return (
    <>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Đăng nhập</CardTitle>
        <CardDescription>
          Nhập email và mật khẩu để truy cập tài khoản của bạn.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Lỗi</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
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
                      type="email"
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
                      tabIndex={-1}
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
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? <Spinner /> : "Đăng Nhập"}
            </Button>
          </CardContent>
        </form>
      </Form>
      <CardContent>
        <div className="relative my-4">
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
          className="w-full"
          type="button"
          onClick={handleGoogleLogin}
          disabled={isPending}
        >
          <FcGoogle className="size-5 mr-2" aria-hidden="true" />
          Google
        </Button>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Chưa có tài khoản?{" "}
          <Link
            className="text-primary hover:underline font-medium"
            href="/auth/register"
          >
            Đăng ký tại đây
          </Link>
        </p>
      </CardFooter>
    </>
  );
};
