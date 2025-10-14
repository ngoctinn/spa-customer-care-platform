// src/app/(admin)/dashboard/time-off/page.tsx
"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  timeOffRequestSchema,
  TimeOffRequestFormValues,
} from "@/features/work-schedules/schemas/time-off.schema";
import { requestTimeOff } from "@/features/work-schedules/api/schedule.api";
import TimeOffRequestForm from "@/features/work-schedules/components/TimeOffRequestForm";
import { useAuth } from "@/features/auth/contexts/AuthContexts";
import { useStaff } from "@/features/staff/hooks/useStaff";
import { FullPageLoader } from "@/components/ui/spinner";
import { useMemo } from "react";

export default function RequestTimeOffPage() {
  const queryClient = useQueryClient();
  const form = useForm<TimeOffRequestFormValues>({
    resolver: zodResolver(timeOffRequestSchema),
  });

  const { user } = useAuth();
  const { data: staffList = [], isLoading: isLoadingStaff } = useStaff();

  const currentUserStaffProfile = useMemo(
    () => staffList.find((staff) => staff.user.id === user?.id),
    [staffList, user]
  );

  const { mutate, isPending } = useMutation({
    mutationFn: requestTimeOff,
    onSuccess: () => {
      toast.success("Gửi yêu cầu nghỉ phép thành công!");
      queryClient.invalidateQueries({ queryKey: ["timeOffRequests"] });
      form.reset();
    },
    onError: (error) => {
      toast.error("Gửi yêu cầu thất bại", { description: error.message });
    },
  });

  const onSubmit = (data: TimeOffRequestFormValues) => {
    if (!currentUserStaffProfile?.id) {
      toast.error("Không thể xác định thông tin nhân viên.", {
        description: "Vui lòng thử đăng nhập lại.",
      });
      return;
    }
    mutate({ ...data, staff_id: currentUserStaffProfile.id });
  };

  if (isLoadingStaff) {
    return <FullPageLoader text="Đang tải thông tin..." />;
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <PageHeader
          title="Tạo đơn xin nghỉ phép"
          description="Điền thông tin chi tiết về khoảng thời gian bạn muốn nghỉ."
          actionNode={
            <Button type="submit" disabled={isPending}>
              {isPending ? "Đang gửi..." : "Gửi yêu cầu"}
            </Button>
          }
        />
        <Card>
          <CardHeader>
            <CardTitle>Thông tin nghỉ phép</CardTitle>
            <CardDescription>
              Vui lòng chọn ngày, giờ và nêu rõ lý do.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TimeOffRequestForm />
          </CardContent>
        </Card>
      </form>
    </FormProvider>
  );
}
