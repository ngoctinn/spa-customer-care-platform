// src/features/appointment/components/ApplyPurchasedItemDialog.tsx
"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { FormDialog } from "@/components/common/FormDialog";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { DataStateMessage } from "@/components/common/DataStateMessage";
import { FullCustomerProfile } from "@/features/customer/types";
import { Appointment } from "@/features/appointment/types";
import { useTreatmentPlans } from "@/features/treatment/hooks/useTreatmentPlans";
import { getCustomerPackages } from "@/features/treatment/apis/customer-packages.api";
import { useLinkAppointmentToPackage } from "@/features/appointment/hooks/useAppointments";

interface ApplyPurchasedItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  appointment: Appointment;
  customer: FullCustomerProfile;
}

const applyItemSchema = z.object({
  selectedItemId: z.string().min(1, "Vui lòng chọn một mục để áp dụng."),
});
type ApplyItemFormValues = z.infer<typeof applyItemSchema>;

export default function ApplyPurchasedItemDialog({
  isOpen,
  onClose,
  onSuccess,
  appointment,
  customer,
}: ApplyPurchasedItemDialogProps) {
  const { data: allPlans, isLoading: isLoadingPlans } = useTreatmentPlans();
  const { data: purchasedPackages = [], isLoading: isLoadingPackages } =
    useQuery({
      queryKey: ["customerPackages", customer.id],
      queryFn: () => getCustomerPackages(customer.id),
      enabled: isOpen,
    });

  const { linkAppointmentMutation, isLinking } = useLinkAppointmentToPackage();

  const form = useForm<ApplyItemFormValues>({
    resolver: zodResolver(applyItemSchema),
  });

  const availableItems = useMemo(() => {
    const items = [];
    // 1. Lọc dịch vụ lẻ
    const purchasedServices =
      customer.purchased_services?.filter(
        (ps) => ps.service_id === appointment.service_id && ps.quantity > 0
      ) || [];
    for (const ps of purchasedServices) {
      items.push({
        id: `service_${ps.service_id}_${ps.purchase_invoice_id}`,
        type: "service",
        name: `Dịch vụ lẻ (Còn ${ps.quantity} lượt)`,
      });
    }

    // 2. Lọc gói liệu trình
    const unfinishedPackages =
      purchasedPackages.filter(
        (p) => p.completed_sessions < p.total_sessions
      ) || [];
    for (const pkg of unfinishedPackages) {
      const plan = allPlans?.find((p) => p.id === pkg.treatment_plan_id);
      const hasServiceInSteps = plan?.steps.some(
        (step) => step.service_id === appointment.service_id
      );
      if (plan && hasServiceInSteps) {
        items.push({
          id: `package_${pkg.id}`,
          type: "package",
          name: `${plan.name} (Còn ${
            pkg.total_sessions - pkg.completed_sessions
          } buổi)`,
        });
      }
    }
    return items;
  }, [
    customer.purchased_services,
    purchasedPackages,
    allPlans,
    appointment.service_id,
  ]);

  const handleSubmit = (data: ApplyItemFormValues) => {
    const [type, id] = data.selectedItemId.split("_");
    linkAppointmentMutation(
      {
        appointmentId: appointment.id,
        packageId: type === "package" ? id : undefined,
        purchasedServiceId: type === "service" ? id : undefined, // Cần điều chỉnh API để hỗ trợ cái này
      },
      { onSuccess }
    );
  };

  const isLoading = isLoadingPlans || isLoadingPackages;

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Áp dụng Gói/Dịch vụ đã mua"
      description="Chọn một mục còn hiệu lực để áp dụng cho lịch hẹn này. Thao tác này sẽ đánh dấu lịch hẹn là đã thanh toán."
      form={form}
      onFormSubmit={handleSubmit}
      isSubmitting={isLinking}
      submitText="Xác nhận Áp dụng"
    >
      {isLoading ? (
        <div className="flex justify-center h-40 items-center">
          <Spinner />
        </div>
      ) : availableItems.length === 0 ? (
        <DataStateMessage
          message="Không có mục phù hợp"
          description="Khách hàng không có dịch vụ hoặc gói liệu trình nào đã mua trước mà có chứa dịch vụ của lịch hẹn này."
        />
      ) : (
        <FormField
          control={form.control}
          name="selectedItemId"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="space-y-2"
                >
                  {availableItems.map((item) => (
                    <FormItem
                      key={item.id}
                      className="flex items-center space-x-3 space-y-0"
                    >
                      <FormControl>
                        <RadioGroupItem value={item.id} />
                      </FormControl>
                      <FormLabel className="font-normal">{item.name}</FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </FormDialog>
  );
}
