// src/features/checkout/components/pos/PosClient.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useReactToPrint } from "react-to-print";

import { usePosStore } from "@/features/checkout/stores/pos-store";
import { Button } from "@/components/ui/button";
import { FullPageLoader } from "@/components/ui/spinner";
import { useAppointmentById } from "@/features/appointment/hooks/useAppointments";
import { useCustomerById } from "@/features/customer/hooks/useCustomers";
import { useServiceById } from "@/features/service/hooks/useServices";

import { PosInvoice } from "./PosInvoice";
import { PosActions } from "./PosActions";
import { XCircle } from "lucide-react";
import { useCreateInvoice } from "@/features/checkout/hooks/usePos";

// Schema cho form thanh toán
const paymentSchema = z.object({
  notes: z.string().optional(),
});
type PaymentFormValues = z.infer<typeof paymentSchema>;

export function PosClient() {
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");

  // Lấy state và actions từ store
  const { setCustomer, addItem, clear, setAppointmentId, receiptRef } =
    usePosStore();

  const { data: appointment, isLoading: isLoadingAppointment } =
    useAppointmentById(appointmentId!);
  const { data: appointmentCustomer, isLoading: isLoadingCustomer } =
    useCustomerById(appointment?.customer_id || "");
  const { data: appointmentService, isLoading: isLoadingService } =
    useServiceById(appointment?.service_id || "");

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
  });

  const { createInvoiceMutation, isPending } = useCreateInvoice();

  // Effect để tải dữ liệu từ lịch hẹn
  useEffect(() => {
    if (appointment && appointmentCustomer && appointmentService) {
      clear(); // Xóa state cũ trước khi thêm mới
      setCustomer(appointmentCustomer);
      addItem({
        id: appointmentService.id,
        name: appointmentService.name,
        price: appointmentService.price,
        quantity: 1,
        type: "service",
        appointment_id: appointment.id,
      });
      setAppointmentId(appointment.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointment, appointmentCustomer, appointmentService]);

  const handlePrint = useReactToPrint({
    // @ts-ignore - This is the correct property for modern react-to-print versions.
    content: () => receiptRef.current,
  });

  const handleSubmit = form.handleSubmit((data) => {
    createInvoiceMutation.mutate(
      { notes: data.notes },
      {
        onSuccess: () => {
          toast.success("Thanh toán thành công!", {
            action: {
              label: "In Hóa Đơn",
              onClick: handlePrint,
            },
          });
          // Không clear() ngay để người dùng có thể in hóa đơn
        },
      }
    );
  });

  if (isLoadingAppointment || isLoadingCustomer || isLoadingService) {
    return <FullPageLoader text="Đang tải thông tin lịch hẹn..." />;
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          <div className="lg:col-span-3">
            <PosInvoice />
          </div>
          <div className="lg:col-span-2">
            <PosActions />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={clear}
            disabled={isPending}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Hủy bỏ
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Đang xử lý..." : "Hoàn tất Thanh toán"}
          </Button>
        </div>
        {/* Component hóa đơn ẩn để in */}
        <div className="hidden">
          {/* <ReceiptToPrint ref={receiptRef} /> */}
        </div>
      </form>
    </FormProvider>
  );
}
