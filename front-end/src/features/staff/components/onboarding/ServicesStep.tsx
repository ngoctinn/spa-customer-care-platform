// src/features/staff/components/onboarding/ServicesStep.tsx
"use client";

import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useServices } from "@/features/service/hooks/useServices";
import { FullPageLoader } from "@/components/ui/spinner";
import { StaffOnboardingFormValues } from "../../schemas";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ServicesStep() {
  const { control } = useFormContext<StaffOnboardingFormValues>();
  const { data: services = [], isLoading } = useServices();

  if (isLoading) {
    return <FullPageLoader text="Đang tải danh sách dịch vụ..." />;
  }

  return (
    <div className="space-y-2">
      <FormLabel>Phân công Dịch vụ</FormLabel>
      <p className="text-sm text-muted-foreground">
        Chọn những dịch vụ mà nhân viên này có thể thực hiện.
      </p>
      <FormField
        control={control}
        name="services.service_ids"
        render={({ field }) => (
          <FormItem>
            <ScrollArea className="h-72 w-full rounded-md border p-4">
              <div className="space-y-4">
                {services.map((service) => (
                  <FormField
                    key={service.id}
                    control={control}
                    name="services.service_ids"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={service.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(service.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([
                                      ...(field.value || []),
                                      service.id,
                                    ])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== service.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {service.name}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
            </ScrollArea>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
