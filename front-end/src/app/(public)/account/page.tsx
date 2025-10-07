// src/app/(public)/account/page.tsx
"use client";

import { useCustomerProfile } from "@/features/customer/hooks/useCustomerProfile";
import { FullPageLoader } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ProfileForm from "@/features/customer/components/ProfileForm";
import LoyaltyCard from "@/features/loyalty/components/LoyaltyCard";

export default function AccountProfilePage() {
  const { data: customer, isLoading, isError } = useCustomerProfile();

  if (isLoading) {
    return <FullPageLoader text="Đang tải thông tin tài khoản..." />;
  }

  if (isError || !customer) {
    return <div>Không thể tải thông tin tài khoản. Vui lòng thử lại.</div>;
  }

  return (
    <div className="space-y-6">
      <LoyaltyCard customer={customer} /> {/* Thêm thẻ Loyalty ở đây */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cá nhân</CardTitle>
          <CardDescription>
            Quản lý và cập nhật thông tin cá nhân của bạn.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm customer={customer} />
        </CardContent>
      </Card>
    </div>
  );
}
