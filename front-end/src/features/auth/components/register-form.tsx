// src/features/auth/components/register-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  MailCheck,
  User,
} from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

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
import { register } from "../apis/register_api";

export const RegisterForm = () => {
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const onSubmit = (values: z.infer<typeof registerSchema>) => {
    startTransition(async () => {
      try {
        await register(values.email, values.name, values.password);
        setIsSuccess(true);
        toast.success("Đăng ký thành công!");
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Đăng ký thất bại. Vui lòng thử lại.");
        }
      }
    });
  };

  if (isSuccess) {
    return (
      <>
        <CardHeader className="text-center">
          <div className="mx-auto bg-success/10 rounded-full p-3">
            <MailCheck className="h-10 w-10 text-success" />
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
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Họ và Tên</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nguyễn Văn A"
                      {...field}
                      disabled={isPending}
                      icon={
                        fieldState.error ? (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        ) : (
                          <User className="h-4 w-4 text-muted-foreground" />
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
              name="email"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="email@example.com"
                      {...field}
                      disabled={isPending}
                      icon={
                        fieldState.error ? (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        ) : (
                          <Mail className="h-4 w-4 text-muted-foreground" />
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
              name="password"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Mật khẩu</FormLabel>
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
                  <FormLabel>Xác nhận mật khẩu</FormLabel>
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
