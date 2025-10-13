// src/features/staff/components/StaffServicesForm.tsx
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { StaffServicesFormValues } from "../schemas";

export default function StaffServicesForm() {
  const { control } = useFormContext<StaffServicesFormValues>();
  const { data: services = [], isLoading } = useServices();

  if (isLoading) {
    return <FullPageLoader text="Đang tải danh sách dịch vụ..." />;
  }

  return (
    <FormField
      control={control}
      name="service_ids"
      render={() => (
        <FormItem>
          <FormLabel className="text-base">Danh sách dịch vụ</FormLabel>
          <ScrollArea className="h-72 w-full rounded-md border p-4">
            <div className="space-y-4">
              {services.map((service) => (
                <FormField
                  key={service.id}
                  control={control}
                  name="service_ids"
                  render={({ field }) => (
                    <FormItem
                      key={service.id}
                      className="flex flex-row items-start space-x-3 space-y-0"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(service.id)}
                          onCheckedChange={(checked) => {
                            const currentValues = field.value || [];
                            return checked
                              ? field.onChange([...currentValues, service.id])
                              : field.onChange(
                                  currentValues.filter(
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
                  )}
                />
              ))}
            </div>
          </ScrollArea>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
