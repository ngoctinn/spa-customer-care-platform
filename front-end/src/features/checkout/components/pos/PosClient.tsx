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
import { PaymentMethod } from "@/features/checkout/types";

// ++ THAY ĐỔI: Mở rộng schema để bao gồm phương thức thanh toán và số tiền đã trả ++
const paymentSchema = z.object({
  payment_method: z.custom<PaymentMethod>((val) => !!val, {
    message: "Vui lòng chọn phương thức thanh toán.",
  }),
  amount_paid: z.number().min(0, "Số tiền trả không được âm.").optional(),
  notes: z.string().optional(),
});
type PaymentFormValues = z.infer<typeof paymentSchema>;

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

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    // ++ THÊM: Gán giá trị mặc định ++
    defaultValues: {
      payment_method: "cash",
      amount_paid: 0,
      notes: "",
    },
  });

  // ++ THÊM: Theo dõi tổng tiền để tự động cập nhật số tiền khách trả ++
  useEffect(() => {
    form.setValue("amount_paid", total);
  }, [total, form]);

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

  // ++ THAY ĐỔI: Truyền toàn bộ dữ liệu form vào mutation ++
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
