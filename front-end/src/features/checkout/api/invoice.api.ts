// src/features/billing/api/invoice.api.ts
import { Invoice } from "@/features/checkout/types";
import { v4 as uuidv4 } from "uuid";
import { Customer } from "@/features/customer/types";
import { Product } from "@/features/product/types";
// import { redeemLoyaltyPoints } from "@/features/customer/api/customer.api";
// import { debitPrepaidCard } from "@/features/prepaid-card/api/prepaid-card.api";

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
  try {
    const newInvoiceId = `inv-${uuidv4()}`;
    // const { customerId, pointsToRedeem, prepaidCardId, prepaidAmountToUse } =
    //   invoiceData;

    // BƯỚC 1: XỬ LÝ CÁC KHOẢN THANH TOÁN ĐẶC BIỆT TRƯỚC (Tạm thời vô hiệu hóa)
    // if (pointsToRedeem && pointsToRedeem > 0) {
    //   await redeemLoyaltyPoints(customerId, pointsToRedeem);
    // }
    // if (prepaidCardId && prepaidAmountToUse && prepaidAmountToUse > 0) {
    //   await debitPrepaidCard(prepaidCardId, prepaidAmountToUse, newInvoiceId);
    // }

    // BƯỚC 2: TẠO HÓA ĐƠN
    const response = await fetch(INVOICES_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...invoiceData,
        id: newInvoiceId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create invoice.");
    }

    const newInvoice: Invoice = await response.json();

    // CÁC BƯỚC 3, 4, 5... (Cập nhật kho, điểm thưởng, v.v...)
    // Giữ nguyên logic cập nhật của bạn ở đây

    return newInvoice;
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw error;
  }
};
