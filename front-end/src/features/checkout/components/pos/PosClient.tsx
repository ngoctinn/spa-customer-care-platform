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
import { PaymentMethod } from "@/features/checkout/types";

// Schema cho một dòng thanh toán
const paymentRecordSchema = z.object({
  method: z.custom<PaymentMethod>((val) => !!val, {
    message: "Vui lòng chọn phương thức.",
  }),
  amount: z.number().min(0, "Số tiền không hợp lệ."),
});

// Schema chính cho toàn bộ form thanh toán
const posFormSchema = z.object({
  payments: z
    .array(paymentRecordSchema)
    .min(1, "Phải có ít nhất một phương thức thanh toán."),
  notes: z.string().optional(),
  pointsToRedeem: z.number().optional(),
  prepaidCardCode: z.string().optional(),
});

type PosFormValues = z.infer<typeof posFormSchema>;

export function PosClient() {
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");

  const { setCustomer, addItem, clear, setAppointmentId, receiptRef, total } =
    usePosStore();

  const { data: appointment, isLoading: isLoadingAppointment } =
    useAppointmentById(appointmentId!);
  const { data: appointmentCustomer, isLoading: isLoadingCustomer } =
    useCustomerById(appointment?.customer_id || "");
  const { data: appointmentService, isLoading: isLoadingService } =
    useServiceById(appointment?.service_id || "");

  const form = useForm<PosFormValues>({
    resolver: zodResolver(posFormSchema),
    defaultValues: {
      payments: [],
      notes: "",
    },
  });

  const { createInvoiceMutation, isPending } = useCreateInvoice();

  useEffect(() => {
    if (appointment && appointmentCustomer && appointmentService) {
      clear();
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
  }, [
    appointment,
    appointmentCustomer,
    appointmentService,
    clear,
    setCustomer,
    addItem,
    setAppointmentId,
  ]);

  const handlePrint = useReactToPrint({
    // @ts-ignore - This is the correct property for modern react-to-print versions.
    content: () => receiptRef.current,
  });

  const handleSubmit = form.handleSubmit((data) => {
    createInvoiceMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Thanh toán thành công!", {
          action: {
            label: "In Hóa Đơn",
            onClick: handlePrint,
          },
        });
      },
    });
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
        <div className="hidden">
          {/* <ReceiptToPrint ref={receiptRef} /> */}
        </div>
      </form>
    </FormProvider>
  );
}
