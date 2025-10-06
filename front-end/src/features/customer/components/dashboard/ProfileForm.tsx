// src/features/customer/components/dashboard/ProfileForm.tsx
"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCustomerProfile } from "../../hooks/useCustomerProfile";
import { FullPageLoader } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";
import { toast } from "sonner";
import { nameSchema, phoneSchema } from "@/lib/schemas";

const profileSchema = z.object({
  full_name: nameSchema,
  phone: phoneSchema.optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const { data: customerProfile, isLoading } = useCustomerProfile();
  // TODO: Tạo hook useUpdateCustomerProfile
  // const updateProfileMutation = useUpdateCustomerProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (customerProfile) {
      form.reset({
        full_name: customerProfile.full_name,
        phone: customerProfile.phone || "",
      });
    }
  }, [customerProfile, form]);

  const onSubmit = (data: ProfileFormValues) => {
    console.log(data);
    toast.info("Tính năng cập nhật đang được phát triển.");
    // updateProfileMutation.mutate(data);
  };

  if (isLoading) {
    return <FullPageLoader text="Đang tải thông tin..." />;
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
            <CardDescription>
              Cập nhật thông tin của bạn. Email không thể thay đổi.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input value={customerProfile?.email} disabled />
              </FormControl>
            </FormItem>
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ và Tên</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số điện thoại</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit">Lưu thay đổi</Button>
          </CardFooter>
        </Card>
      </form>
    </FormProvider>
  );
}
