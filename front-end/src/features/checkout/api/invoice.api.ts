// src/features/billing/api/invoice.api.ts
import { Invoice } from "@/features/checkout/types";
import { v4 as uuidv4 } from "uuid";
import { Customer } from "@/features/customer/types";
import { Product } from "@/features/product/types";
// import { redeemLoyaltyPoints } from "@/features/customer/api/customer.api";
// import { debitPrepaidCard } from "@/features/prepaid-card/api/prepaid-card.api";
import apiClient from "@/lib/apiClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const INVOICES_API_URL = `${API_URL}/invoices`;
const CUSTOMERS_API_URL = `${API_URL}/customers`;
const PRODUCTS_API_URL = `${API_URL}/products`;
const POINTS_PER_VND = 1 / 10000;

export type InvoiceCreationData = Omit<
  Invoice,
  "id" | "createdAt" | "updatedAt"
> & {
  pointsToRedeem?: number;
  prepaidCardId?: string;
  prepaidAmountToUse?: number;
};

export const createInvoice = async (
  invoiceData: InvoiceCreationData
): Promise<Invoice> => {
  // Chỉ giữ lại một lời gọi API duy nhất, sạch sẽ và nhất quán
  // Backend nên tự xử lý việc tạo ID và timestamps
  try {
    const newInvoice = await apiClient<Invoice>("/invoices", {
      method: "POST",
      body: JSON.stringify(invoiceData),
    });
    return newInvoice;
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw error; // Ném lỗi để React Query có thể xử lý
  }
};
