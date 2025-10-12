// src/features/auth/components/forgot-password-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, Mail, MailCheck } from "lucide-react";
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
import { forgotPasswordSchema } from "@/features/auth/schemas";

export const ForgotPasswordForm = () => {
  const [isPending, startTransition] = useTransition();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
    mode: "onChange",
  });

  const onSubmit = (values: z.infer<typeof forgotPasswordSchema>) => {
    startTransition(async () => {
      try {
        // await forgotPassword(values.email);
        toast.success("Yêu cầu đã được gửi đi!", {
          description: "Vui lòng kiểm tra email để đặt lại mật khẩu.",
        });
        setIsSubmitted(true);
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Gửi yêu cầu thất bại. Vui lòng thử lại.");
        }
      }
    });
  };

  if (isSubmitted) {
    return (
      <CardHeader className="text-center">
        <div className="mx-auto bg-primary/10 rounded-full p-3">
          <MailCheck className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="mt-4">Kiểm tra Email của bạn</CardTitle>
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
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? "Đang gửi..." : "Gửi link đặt lại mật khẩu"}
            </Button>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground text-center w-full">
              Nhớ mật khẩu rồi?{" "}
              <Link
                className="text-primary hover:underline font-medium"
                href="/auth/login"
              >
                Đăng nhập
              </Link>
            </p>
          </CardFooter>
        </form>
      </Form>
    </>
  );
};
