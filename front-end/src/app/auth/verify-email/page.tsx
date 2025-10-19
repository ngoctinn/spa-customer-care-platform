// src/app/auth/verify-email/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { verifyEmail } from "@/features/auth/apis/verify.api";

// Component con chứa logic và UI chính
function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Đang xác thực tài khoản của bạn...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Đường dẫn xác thực không hợp lệ hoặc đã hết hạn.");
      return;
    }

    verifyEmail(token)
      .then(() => {
        setStatus("success");
        setMessage("Tài khoản đã được kích hoạt. Đang chuyển hướng...");
        setTimeout(() => {
          router.push("/auth/login");
        }, 2500); // Tăng thời gian chờ một chút
      })
      .catch((error: any) => {
        setStatus("error");
        setMessage(
          error.data?.detail || "Token không hợp lệ hoặc đã hết hạn."
        );
      });
  }, [token, router]);

  // Render UI dựa trên trạng thái
  switch (status) {
    case "success":
      return (
        <>
          <CardHeader className="text-center">
            <div className="mx-auto bg-success/10 rounded-full p-3 w-fit">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
            <CardTitle className="mt-4">Xác thực thành công!</CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </>
      );
    case "error":
      return (
        <>
          <CardHeader className="text-center">
            <div className="mx-auto bg-destructive/10 rounded-full p-3 w-fit">
              <XCircle className="h-10 w-10 text-destructive" />
            </div>
            <CardTitle className="mt-4">Xác thực thất bại!</CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild>
              <Link href="/auth/login">Quay lại trang đăng nhập</Link>
            </Button>
          </CardContent>
        </>
      );
    default: // loading
      return (
        <>
          <CardHeader className="text-center">
            <CardTitle>Đang xác thực</CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </CardContent>
        </>
      );
  }
}

// Component cha để sử dụng Suspense
export default function VerifyEmailPage() {
  // AuthLayout sẽ cung cấp Card và căn giữa
  // Chúng ta chỉ cần render nội dung bên trong Card
  return (
    <Suspense fallback={<LoadingState />}>
      <VerifyEmailContent />
    </Suspense>
  );
}

// Component cho trạng thái chờ của Suspense
const LoadingState = () => (
  <>
    <CardHeader className="text-center">
      <CardTitle>Đang tải...</CardTitle>
    </CardHeader>
    <CardContent className="flex justify-center py-8">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </CardContent>
  </>
);
