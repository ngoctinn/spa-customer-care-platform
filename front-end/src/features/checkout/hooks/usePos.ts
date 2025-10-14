// src/features/checkout/hooks/usePos.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createInvoice } from "@/features/checkout/api/invoice.api";
import { usePosStore } from "@/features/checkout/stores/pos-store";
import { InvoiceCreationData } from "@/features/checkout/api/invoice.api";

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  const { items, customer, appointmentId } = usePosStore();

  return {
    createInvoiceMutation: useMutation({
      mutationFn: async (data: { notes?: string }) => {
        if (!customer) {
          throw new Error("Vui lòng chọn khách hàng.");
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
            discount_amount: 0, // Cần logic tính discount
            appointment_id: item.appointment_id,
          })),
          subtotal: items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          ),
          discount_amount: 0,
          tax_amount: 0,
          total_amount: items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          ),
          payment_method: "cash", // Cần logic chọn payment method
          status: "paid",
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
    }),
    isPending: useMutation({
      mutationFn: async (data: { notes?: string }) => {},
    }).isPending,
  };
};
