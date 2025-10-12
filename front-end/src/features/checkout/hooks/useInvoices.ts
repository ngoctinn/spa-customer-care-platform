// src/features/checkout/hooks/useInvoices.ts
import { useQuery } from "@tanstack/react-query";
import { getInvoicesByCustomerId } from "@/features/checkout/api/invoice.api";
import { Invoice } from "../types";

export const useInvoices = (customerId?: string) => {
  return useQuery<Invoice[]>({
    queryKey: ["invoices", { customerId }],
    queryFn: () => getInvoicesByCustomerId(customerId!),
    enabled: !!customerId,
  });
};
