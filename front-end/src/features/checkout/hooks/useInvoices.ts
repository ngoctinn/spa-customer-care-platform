// src/features/checkout/hooks/useInvoices.ts
import { useQuery } from "@tanstack/react-query";
import {
  getInvoicesByCustomerId,
  getInvoiceById,
} from "@/features/checkout/api/invoice.api";
import { Invoice } from "../types";

export const useInvoices = (customerId?: string) => {
  return useQuery<Invoice[]>({
    queryKey: ["invoices", { customerId }],
    queryFn: () => getInvoicesByCustomerId(customerId!),
    enabled: !!customerId,
  });
};

export const useInvoiceById = (invoiceId: string) => {
  return useQuery<Invoice>({
    queryKey: ["invoices", invoiceId],
    queryFn: () => getInvoiceById(invoiceId),
    enabled: !!invoiceId,
  });
};
