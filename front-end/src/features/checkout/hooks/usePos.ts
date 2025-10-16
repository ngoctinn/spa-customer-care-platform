// src/features/checkout/hooks/usePos.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createInvoice,
  InvoiceCreationData,
} from "@/features/checkout/api/invoice.api";
import { usePosStore } from "@/features/checkout/stores/pos-store";
import { InvoiceStatus, PaymentMethod } from "@/features/checkout/types";

interface CreateInvoicePayload {
  notes?: string;
  payment_method: PaymentMethod;
  amount_paid?: number;
}

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  const { items, customer, appointmentId, total } = usePosStore();

  const createInvoiceMutation = useMutation({
    mutationFn: async (data: CreateInvoicePayload) => {
      if (!customer) {
        throw new Error("Vui lòng chọn khách hàng.");
      }
      if (items.length === 0) {
        throw new Error("Hóa đơn phải có ít nhất một sản phẩm/dịch vụ.");
      }

      const amountPaid = data.amount_paid || 0;

      let status: InvoiceStatus = "pending";
      if (data.payment_method === "debt") {
        status = "pending";
      } else if (amountPaid >= total) {
        status = "paid";
      } else if (amountPaid > 0 && amountPaid < total) {
        status = "partial";
      }

      const invoiceData: InvoiceCreationData = {
        customer_id: customer.id,
        appointment_id: appointmentId || undefined,
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price_per_unit: item.price,
          total_price: item.price * item.quantity,
          type: item.type,
          discount_amount: 0,
          appointment_id: item.appointment_id,
        })),
        subtotal: total,
        discount_amount: 0,
        tax_amount: 0,
        total_amount: total,
        payment_method: data.payment_method,
        amount_paid: amountPaid,
        status: status,
        notes: data.notes,
      };

      return createInvoice(invoiceData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
    onError: (error: any) => {
      toast.error("Tạo hóa đơn thất bại", {
        description: error.message,
      });
    },
  });

  return {
    createInvoiceMutation,
    isPending: createInvoiceMutation.isPending,
  };
};
