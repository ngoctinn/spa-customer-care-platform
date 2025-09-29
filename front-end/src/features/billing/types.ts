import { UUID } from "crypto";

export type InvoiceItemType = "service" | "product" | "treatment" | "other";
export type PaymentMethod =
  | "cash"
  | "card"
  | "transfer"
  | "cod"
  | "combined"
  | "prepaid";
export type InvoiceStatus = "pending" | "paid" | "cancelled" | "refunded";

export interface InvoiceItem {
  id: UUID; // ID của service, product...
  name: string;
  quantity: number;
  price_per_unit: number; // Giá tại thời điểm bán
  total_price: number;
  type: InvoiceItemType;
  discount_amount: number;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
}

export interface Invoice {
  id: UUID;
  customer_id: UUID;
  appointment_id?: UUID;
  items: InvoiceItem[];
  subtotal: number; // Tổng tiền trước giảm giá
  discount_amount: number;
  tax_amount: number;
  total_amount: number; // Số tiền cuối cùng
  payment_method: PaymentMethod;
  status: InvoiceStatus;
  shipping_address?: ShippingAddress;
  notes?: string;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}
