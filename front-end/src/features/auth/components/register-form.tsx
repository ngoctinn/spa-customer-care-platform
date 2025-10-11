// src/features/auth/components/register-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useTransition } from "react";
import { MailCheck } from "lucide-react";
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
import { registerSchema } from "@/features/auth/schemas";
import { toast } from "sonner";
import { register } from "../apis/register_api";

export const RegisterForm = () => {
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: z.infer<typeof registerSchema>) => {
    startTransition(async () => {
      // Gọi API đăng ký

      try {
        const data = await register(values.email, values.name, values.password);
        setIsSuccess(true);
        toast.success("Đăng ký thành công!", data);
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          // toast.error("Đăng ký thất bại. Vui lòng thử lại.");
          console.error("Đăng ký thất bại", error);
        }
      }
      console.log(values);
    });
  };

  if (isSuccess) {
    return (
      <>
        <CardHeader className="text-center">
          <div className="mx-auto bg-success/80 rounded-full p-3">
            <MailCheck className="h-10 w-10 text-success " />
          </div>
          <CardTitle className="mt-4">Đăng ký thành công!</CardTitle>
          <CardDescription>
            Chúng tôi đã gửi một liên kết xác thực đến địa chỉ email của bạn.
            Vui lòng kiểm tra hộp thư đến (và cả mục spam) để hoàn tất.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button asChild size="lg">
            <a
              href="https://mail.google.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Đi đến Gmail
            </a>
          </Button>
        </CardContent>
      </>
    );
  }

  return (
    <>
      <CardHeader className="text-center">
        <CardTitle>Tạo tài khoản</CardTitle>
        <CardDescription>
          Bắt đầu hành trình chăm sóc của bạn ngay hôm nay.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ và Tên</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nguyễn Văn A"
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
                  <FormLabel>Mật khẩu</FormLabel>
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
                  <FormLabel>Xác nhận mật khẩu</FormLabel>
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
              {isPending ? "Đang xử lý..." : "Tạo tài khoản"}
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col items-center gap-2 mt-4">
            <p className="text-sm text-muted-foreground text-center w-full">
              Đã có tài khoản?{" "}
              <Link
                className="text-primary hover:underline font-medium"
                href="/auth/login"
              >
                Đăng nhập tại đây
              </Link>
            </p>
          </CardFooter>
        </form>
      </Form>
    </>
  );
};
