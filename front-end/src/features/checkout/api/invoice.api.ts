// src/features/checkout/api/invoice.api.ts
// src/features/billing/api/invoice.api.ts
import { Invoice, ShippingAddress } from "@/features/checkout/types";
import { v4 as uuidv4 } from "uuid";
import { Customer } from "@/features/customer/types";
import { Product } from "@/features/product/types";
// import { redeemLoyaltyPoints } from "@/features/customer/api/customer.api";
// import { debitPrepaidCard } from "@/features/prepaid-card/api/prepaid-card.api";
import apiClient from "@/lib/apiClient";
import { CartItem } from "@/features/cart/stores/cart-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const INVOICES_API_URL = `${API_URL}/invoices`;
const CUSTOMERS_API_URL = `${API_URL}/customers`;
const PRODUCTS_API_URL = `${API_URL}/products`;
const POINTS_PER_VND = 1 / 10000;

interface CreateOrderPayload {
  items: CartItem[];
  payment_method: string;
  shipping_address?: ShippingAddress;
  notes?: string;
}
/**
 * Gọi API backend để tạo một hóa đơn/đơn hàng mới.
 * Backend sẽ tự quyết định trạng thái (pending, processing...)
 * @param payload Dữ liệu giỏ hàng, phương thức thanh toán, địa chỉ...
 * @returns Promise chứa thông tin hóa đơn đã được tạo.
 */
export async function createOrder(
  payload: CreateOrderPayload
): Promise<Invoice> {
  // Giả sử endpoint của bạn là /orders
  return apiClient<Invoice>("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Lấy thông tin chi tiết của một hóa đơn bằng ID.
 * @param invoiceId ID của hóa đơn cần lấy.
 * @returns Promise chứa thông tin chi tiết hóa đơn.
 */
export async function getInvoiceById(invoiceId: string): Promise<Invoice> {
  // Giả sử endpoint của bạn là /invoices/:id
  return apiClient<Invoice>(`/invoices/${invoiceId}`);
}

/**
 * Lấy danh sách hóa đơn theo ID khách hàng.
 * @param customerId ID của khách hàng.
 * @returns Promise chứa danh sách hóa đơn.
 */
export async function getInvoicesByCustomerId(
  customerId: string
): Promise<Invoice[]> {
  return apiClient<Invoice[]>(`/invoices?customerId=${customerId}`);
}

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
