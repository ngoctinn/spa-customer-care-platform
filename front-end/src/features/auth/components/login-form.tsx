// src/features/auth/components/login-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff, Loader2, Mail, Send } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
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
import { useAuth } from "@/features/auth/contexts/AuthContexts";
import { loginSchema } from "@/features/auth/schemas";
import { ApiError } from "@/lib/apiClient";
import { resendVerificationEmail } from "@/features/auth/apis/verify.api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const LoginForm = () => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    const googleError = searchParams.get("error");
    if (googleError) {
      setError("Đăng nhập với Google thất bại. Vui lòng thử lại.");
    }
  }, [searchParams]);

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      const email = form.getValues("email");
      await resendVerificationEmail(email);
      toast.success("Đã gửi lại email xác thực!", {
        description: "Vui lòng kiểm tra hộp thư của bạn.",
      });
      setNeedsVerification(false);
    } catch (err) {
      toast.error("Gửi lại thất bại", {
        description:
          err instanceof Error ? err.message : "Vui lòng thử lại sau.",
      });
    } finally {
      setIsResending(false);
    }
  };

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    setError(null);
    setNeedsVerification(false);
    startTransition(async () => {
      try {
        await login(values);
        toast.success("Đăng nhập thành công!", {
          description: `Chào mừng bạn đã quay trở lại, ${values.email}.`,
        });
        // Việc chuyển hướng đã được xử lý bên trong hàm login của AuthContext
      } catch (err) {
        if (err instanceof ApiError && err.status === 403) {
          setNeedsVerification(true);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Đã xảy ra lỗi không xác định. Vui lòng thử lại.");
        }
      }
    });
  };

  const handleGoogleLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    window.location.href = `${apiUrl}/auth/login/google`;
  };

  return (
    <>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Chào mừng trở lại!</CardTitle>
        <CardDescription>
          Đăng nhập để tiếp tục hành trình chăm sóc của bạn.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Đăng nhập thất bại</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {needsVerification && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Tài khoản chưa kích hoạt</AlertTitle>
                <AlertDescription>
                  <div className="flex flex-col items-start">
                    <span>
                      Vui lòng kiểm tra email để xác thực tài khoản của bạn.
                    </span>
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto mt-2 text-destructive font-semibold"
                      onClick={handleResendVerification}
                      disabled={isResending}
                    >
                      {isResending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-4 w-4" />
                      )}
                      Gửi lại email xác thực
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
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
                      type="email"
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
                    <Input
                      placeholder="••••••••"
                      {...field}
                      disabled={isPending}
                      type={showPassword ? "text" : "password"}
                      icon={
                        fieldState.error ? (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        ) : showPassword ? (
                          <EyeOff
                            className="h-4 w-4 text-muted-foreground cursor-pointer"
                            onClick={() => setShowPassword(false)}
                          />
                        ) : (
                          <Eye
                            className="h-4 w-4 text-muted-foreground cursor-pointer"
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
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? "Đang xử lý..." : "Đăng Nhập"}
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
          <FcGoogle className="mr-2 h-5 w-5" />
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
