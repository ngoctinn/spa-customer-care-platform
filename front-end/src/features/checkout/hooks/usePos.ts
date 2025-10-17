// src/features/checkout/hooks/usePos.ts
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

// ++ CẬP NHẬT PAYLOAD ++
interface CreateInvoicePayload {
  notes?: string;
  payments: PaymentRecord[]; // Thay thế payment_method và amount_paid
  pointsToRedeem?: number;
  prepaidCardCode?: string;
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

      // Backend sẽ tính toán lại tổng tiền, giảm giá và xác định trạng thái
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
        // ++ GỬI DỮ LIỆU MỚI LÊN BACKEND ++
        payment_records: data.payments,
        points_to_redeem: data.pointsToRedeem,
        prepaid_card_code: data.prepaidCardCode,

        // Các trường này sẽ do backend tính toán và ghi đè
        subtotal: total,
        discount_amount: 0,
        tax_amount: 0,
        total_amount: total,
        status: "pending", // Backend sẽ quyết định trạng thái cuối cùng
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
