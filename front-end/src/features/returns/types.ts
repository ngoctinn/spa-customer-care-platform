// src/features/returns/types.ts

import { Invoice, InvoiceItem, PaymentMethod } from "@/features/checkout/types";
import { FullCustomerProfile } from "@/features/customer/types";

// Các phương thức hoàn tiền khả dụng
export type RefundMethod = "cash" | "transfer" | "debt_credit";

// Đại diện cho một sản phẩm trong giao dịch trả hàng
export interface ReturnItem {
  invoiceItemId: string; // ID của item gốc trong hóa đơn
  productId: string;
  name: string;
  quantity: number; // Số lượng trả lại
  pricePerUnit: number;
}

// Dữ liệu cần thiết để tạo một giao dịch trả hàng
export interface CreateReturnPayload {
  invoiceId: string;
  items: Array<Pick<ReturnItem, "productId" | "quantity">>;
  refundMethod: RefundMethod;
  reason?: string;
}

// Giao dịch trả hàng hoàn chỉnh (dữ liệu trả về từ API)
export interface ReturnTransaction {
  id: string;
  originalInvoiceId: string;
  customerId: string;
  staffId: string;
  returnedItems: Array<{
    productId: string;
    quantity: number;
    pricePerUnit: number;
  }>;
  totalRefundAmount: number;
  refundMethod: RefundMethod;
  reason?: string;
  createdAt: string;
}

// Trạng thái của tiến trình trả hàng trên UI
export interface ReturnProcessState {
  step: number;
  selectedInvoice: Invoice | null;
  itemsToReturn: ReturnItem[];
  refundMethod: RefundMethod;
  totalRefundAmount: number;
}
