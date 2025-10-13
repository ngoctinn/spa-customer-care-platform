// src/features/staff/components/StaffOnboardingWizard.tsx
"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { staffOnboardingSchema, StaffOnboardingFormValues } from "../schemas";
import { onboardStaff } from "../api/staff.api";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import AccountStep from "./onboarding/AccountStep";
import ProfileStep from "./onboarding/ProfileStep";
import ServicesStep from "./onboarding/ServicesStep";
import ScheduleStep from "./onboarding/ScheduleStep";
import { Separator } from "@/components/ui/separator";

const steps = [
  { id: 1, name: "Tài khoản", fields: ["account.email", "account.role_id"] },
  { id: 2, name: "Hồ sơ", fields: ["profile.full_name", "profile.phone"] },
  { id: 3, name: "Dịch vụ", fields: ["services.service_ids"] },
  { id: 4, name: "Lịch làm việc", fields: ["schedule"] },
];

interface StaffOnboardingWizardProps {
  onClose: () => void;
}

export default function StaffOnboardingWizard({
  onClose,
}: StaffOnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const queryClient = useQueryClient();

  const form = useForm<StaffOnboardingFormValues>({
    resolver: zodResolver(staffOnboardingSchema),
    defaultValues: {
      account: { email: "", role_id: "" },
      profile: { full_name: "", phone: "" },
      services: { service_ids: [] },
      schedule: {
        schedules: Array.from({ length: 7 }, (_, i) => ({
          day_of_week: i + 1,
          is_active: i < 5, // Mặc định T2-T6
          start_time: null,
          end_time: null,
        })),
      },
    },
  });

  const { mutate: onboardStaffMutation, isPending } = useMutation({
    mutationFn: onboardStaff,
    onSuccess: () => {
      toast.success("Thêm nhân viên thành công!", {
        description: "Một email kích hoạt đã được gửi đến nhân viên.",
      });
      queryClient.invalidateQueries({ queryKey: ["staffList"] });
      onClose();
    },
    onError: (error) => {
      toast.error("Thêm nhân viên thất bại", { description: error.message });
    },
  });

  const processForm = (data: StaffOnboardingFormValues) => {
    onboardStaffMutation(data);
  };

  const next = async () => {
    const fields = steps[currentStep].fields;
    const output = await form.trigger(fields as any, { shouldFocus: true });
    if (!output) return;
    if (currentStep < steps.length - 1) {
      setCurrentStep((step) => step + 1);
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setCurrentStep((step) => step - 1);
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(processForm)} className="space-y-6">
        {/* Navigation */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">{steps[currentStep].name}</h3>
            <p className="text-sm text-muted-foreground">
              Bước {currentStep + 1} trên {steps.length}
            </p>
          </div>
          {currentStep > 0 && (
            <Button type="button" variant="ghost" onClick={prev}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
            </Button>
          )}
        </div>
        <Separator />

        {/* Content */}
        <div className="min-h-[350px]">
          {currentStep === 0 && <AccountStep />}
          {currentStep === 1 && <ProfileStep />}
          {currentStep === 2 && <ServicesStep />}
          {currentStep === 3 && <ScheduleStep />}
        </div>

        {/* Actions */}
        <Separator />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          {currentStep < steps.length - 1 && (
            <Button type="button" onClick={next}>
              Tiếp theo
            </Button>
          )}
          {currentStep === steps.length - 1 && (
            <Button type="submit" disabled={isPending}>
              {isPending ? "Đang xử lý..." : "Hoàn tất"}
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
