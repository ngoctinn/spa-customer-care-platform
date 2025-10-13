// src/app/auth/verify-email/page.tsx
"use client";

import Link from "next/link";
import { CheckCircle2, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function VerifyEmailPage() {
  return (
    // Component này sẽ nằm trong AuthLayout đã có
    // nên sẽ tự động được căn giữa màn hình.
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto bg-success/10 rounded-full p-3">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <CardTitle className="mt-4">Xác thực thành công!</CardTitle>
          <CardDescription>
            Tài khoản của bạn đã được kích hoạt. Chào mừng bạn đến với Serenity
            Spa.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Bạn có thể bắt đầu khám phá các dịch vụ của chúng tôi ngay bây giờ.
          </p>
          <Button asChild size="lg" className="w-full">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Quay về trang chủ
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
