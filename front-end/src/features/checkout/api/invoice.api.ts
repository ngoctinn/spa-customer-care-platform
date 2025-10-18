// src/features/checkout/api/invoice.api.ts
import {
  Invoice,
  ShippingAddress,
  PaymentRecord,
} from "@/features/checkout/types";
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
  prepaid_card_code?: string;
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
  "id" | "created_at" | "updated_at" | "is_deleted" | "payment_method"
> & {
  points_to_redeem?: number;
  prepaid_card_code?: string;
  payment_records: PaymentRecord[]; // Sử dụng mảng payment records
};

export const createInvoice = async (
  invoiceData: InvoiceCreationData
): Promise<Invoice> => {
  try {
    const newInvoice = await apiClient<Invoice>("/invoices", {
      method: "POST",
      body: JSON.stringify(invoiceData),
    });
    return newInvoice;
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw error;
  }
};
