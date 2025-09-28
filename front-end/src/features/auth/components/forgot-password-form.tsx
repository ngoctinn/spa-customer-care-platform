// src/features/auth/components/forgot-password-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useTransition } from "react";

import { forgotPasswordSchema } from "@/features/auth/schemas";
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
import { toast } from "sonner";

export const ForgotPasswordForm = () => {
  const [isPending, startTransition] = useTransition();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (values: z.infer<typeof forgotPasswordSchema>) => {
    startTransition(async () => {
      try {
        //await forgotPassword(values.email);
        toast.success("Yêu cầu đã được gửi đi!", {
          description: "Vui lòng kiểm tra email để đặt lại mật khẩu.",
        });
        setIsSubmitted(true); // Cập nhật state khi gửi thành công
        console.log("Yêu cầu đặt lại mật khẩu đã được gửi cho:", values.email);
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message);
          console.error("Lỗi khi yêu cầu đặt lại mật khẩu:", error.message);
        } else {
          toast.error("Gửi yêu cầu thất bại. Vui lòng thử lại.");
          console.error("Lỗi không xác định:", error);
        }
      }
    });
  };

  // Nếu đã gửi thành công, hiển thị thông báo
  if (isSubmitted) {
    return (
      <CardHeader className="text-center">
        <CardTitle>Kiểm tra Email của bạn</CardTitle>
        <CardDescription>
          Chúng tôi đã gửi một đường link đặt lại mật khẩu đến email của bạn.
          Vui lòng kiểm tra hộp thư đến (và cả mục spam).
        </CardDescription>
      </CardHeader>
    );
  }
  return (
    <>
      <CardHeader className="text-center">
        <CardTitle>Quên mật khẩu</CardTitle>
        <CardDescription>
          Nhập email và chúng tôi sẽ gửi mail để đặt lại mật khẩu.
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
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Đang gửi..." : "Gửi link đặt lại mật khẩu"}
            </Button>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground text-center w-full">
              Nhớ mật khẩu rồi?{" "}
              <a
                className="text-primary hover:underline font-medium"
                href="/auth/login"
              >
                Đăng nhập
              </a>
            </p>
          </CardFooter>
        </form>
      </Form>
    </>
  );
};
