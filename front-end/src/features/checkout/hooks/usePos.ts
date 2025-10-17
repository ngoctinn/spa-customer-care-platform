import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createInvoice,
  InvoiceCreationData,
} from "@/features/checkout/api/invoice.api";
import { usePosStore } from "@/features/checkout/stores/pos-store";
import {
  InvoiceStatus,
  PaymentMethod,
  PaymentRecord,
} from "@/features/checkout/types";

interface CreateInvoicePayload {
  notes?: string;
  payments: PaymentRecord[];
  pointsToRedeem?: number;
  prepaidCardCode?: string;
  discountFromPoints?: number;
  prepaidCardDiscount?: number;
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

      const totalPaid = data.payments.reduce((sum, p) => sum + p.amount, 0);
      const discountAmount =
        (data.discountFromPoints || 0) + (data.prepaidCardDiscount || 0);
      const finalTotal = total - discountAmount;
      const remainingAmount = finalTotal - totalPaid;

      const hasDebtMethod = data.payments.some((p) => p.method === "debt");

      if (remainingAmount > 0.01 && !hasDebtMethod) {
        // Cho phép sai số nhỏ
        throw new Error(
          "Số tiền thanh toán không đủ. Vui lòng ghi nợ phần còn lại hoặc thanh toán đủ."
        );
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
        notes: data.notes,
        payment_records: data.payments,
        points_to_redeem: data.pointsToRedeem,
        prepaid_card_code: data.prepaidCardCode,
        subtotal: total,
        discount_amount: discountAmount,
        tax_amount: 0,
        total_amount: finalTotal,
        status: "pending",
      };

      return createInvoice(invoiceData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
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
