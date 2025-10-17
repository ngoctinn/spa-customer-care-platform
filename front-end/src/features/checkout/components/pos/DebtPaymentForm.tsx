// src/features/checkout/components/pos/DebtPaymentForm.tsx
"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import React, { useRef } from "react"; // ++ THÊM useRef ++
import { useReactToPrint } from "react-to-print"; // ++ THÊM react-to-print ++

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePosStore } from "@/features/checkout/stores/pos-store";
import { CustomerSelector } from "./CustomerSelector";
import PriceInput from "@/components/common/PriceInput";
import { PaymentMethod } from "@/features/checkout/types";
import apiClient from "@/lib/apiClient";
import { DebtPaymentReceipt } from "./DebtPaymentReceipt"; // ++ THÊM IMPORT BIÊN LAI ++
import { FullCustomerProfile } from "@/features/customer/types"; // ++ THÊM IMPORT ++

// Schema cho form thanh toán nợ
const debtPaymentSchema = z.object({
  amount: z.number().positive("Số tiền phải lớn hơn 0."),
  payment_method: z.custom<PaymentMethod>((val) => !!val, {
    message: "Vui lòng chọn phương thức thanh toán.",
  }),
  notes: z.string().optional(),
});
type DebtPaymentFormValues = z.infer<typeof debtPaymentSchema>;

const payDebt = async (
  payload: DebtPaymentFormValues & { customerId: string }
) => {
  const { customerId, ...data } = payload;
  return apiClient<FullCustomerProfile>(`/customers/${customerId}/pay-debt`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

const paymentMethods: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Tiền mặt" },
  { value: "card", label: "Thẻ" },
  { value: "transfer", label: "Chuyển khoản" },
];

export function DebtPaymentForm() {
  const { customer, setCustomer } = usePosStore();
  const queryClient = useQueryClient();
  const receiptRef = useRef<HTMLDivElement>(null); // ++ TẠO REF CHO BIÊN LAI ++
  const [lastPaymentData, setLastPaymentData] =
    React.useState<DebtPaymentFormValues | null>(null);
  const [lastCustomerData, setLastCustomerData] =
    React.useState<FullCustomerProfile | null>(null);

  const form = useForm<DebtPaymentFormValues>({
    resolver: zodResolver(debtPaymentSchema),
    defaultValues: {
      amount: 0,
      payment_method: "cash",
      notes: "",
    },
  });

  const handlePrint = useReactToPrint({
    // @ts-ignore - This is the correct property for modern react-to-print versions.
    content: () => receiptRef.current,
  });

  const payDebtMutation = useMutation({
    mutationFn: payDebt,
    onSuccess: (updatedCustomer, variables) => {
      toast.success("Thanh toán công nợ thành công!", {
        action: (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                // Lưu dữ liệu để in
                setLastCustomerData(updatedCustomer);
                setLastPaymentData({
                  amount: variables.amount,
                  payment_method: variables.payment_method,
                  notes: variables.notes,
                });
                setTimeout(handlePrint, 100); // Chờ state update rồi mới in
              }}
            >
              In biên lai
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                toast.info("Chức năng gửi email đang được phát triển.")
              }
            >
              Gửi Email
            </Button>
          </div>
        ),
        duration: 10000,
      });
      queryClient.invalidateQueries({ queryKey: ["customers", customer?.id] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setCustomer(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast.error("Thanh toán thất bại", { description: error.message });
    },
  });

  const onSubmit = (data: DebtPaymentFormValues) => {
    if (!customer) {
      toast.error("Vui lòng chọn khách hàng.");
      return;
    }
    payDebtMutation.mutate({ ...data, customerId: customer.id });
  };

  const currentDebt = customer?.debt_amount || 0;

  return (
    <>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CustomerSelector />

          {customer && (
            <Card>
              <CardHeader>
                <CardTitle>Thông tin công nợ</CardTitle>
                <CardDescription>
                  Nhập số tiền khách hàng muốn thanh toán cho khoản nợ hiện tại.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-baseline p-4 rounded-lg bg-destructive/10">
                  <p className="text-sm text-destructive">Công nợ hiện tại</p>
                  <p className="text-2xl font-bold text-destructive">
                    {currentDebt.toLocaleString("vi-VN")}đ
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số tiền thanh toán</FormLabel>
                      <FormControl>
                        <PriceInput
                          name={field.name}
                          label="Số tiền thanh toán"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="payment_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phương thức</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {paymentMethods.map((method) => (
                            <SelectItem key={method.value} value={method.value}>
                              {method.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ghi chú (Tùy chọn)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Thêm ghi chú..." {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={
                !customer || payDebtMutation.isPending || currentDebt <= 0
              }
            >
              {payDebtMutation.isPending
                ? "Đang xử lý..."
                : "Xác nhận Thanh toán Nợ"}
            </Button>
          </div>
        </form>
      </FormProvider>
      {/* ++ COMPONENT BIÊN LAI ẨN ĐỂ IN ++ */}
      <div className="hidden">
        {lastPaymentData && lastCustomerData && (
          <DebtPaymentReceipt
            ref={receiptRef}
            payment={lastPaymentData}
            customer={lastCustomerData}
          />
        )}
      </div>
    </>
  );
}
