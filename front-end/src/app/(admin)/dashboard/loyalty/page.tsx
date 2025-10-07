// src/app/(admin)/dashboard/loyalty/page.tsx
"use client";

import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useLoyaltySettings,
  useUpdateLoyaltySettings,
} from "@/features/loyalty/hooks/useLoyalty";
import {
  loyaltySettingsSchema,
  LoyaltySettingsFormValues,
} from "@/features/loyalty/schemas";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { FullPageLoader } from "@/components/ui/spinner";
import LoyaltySettingsForm from "@/features/loyalty/components/LoyaltySettingsForm";

export default function LoyaltySettingsPage() {
  const { data: settings, isLoading } = useLoyaltySettings();
  const updateMutation = useUpdateLoyaltySettings();

  const form = useForm<LoyaltySettingsFormValues>({
    resolver: zodResolver(loyaltySettingsSchema),
  });

  useEffect(() => {
    if (settings) {
      form.reset(settings);
    }
  }, [settings, form]);

  const onSubmit = (data: LoyaltySettingsFormValues) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return <FullPageLoader text="Đang tải cài đặt..." />;
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <PageHeader
          title="Khách hàng thân thiết"
          description="Thiết lập các cấp bậc thành viên và tỷ lệ tích điểm cho khách hàng."
          actionNode={
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          }
        />
        <LoyaltySettingsForm />
      </form>
    </FormProvider>
  );
}
