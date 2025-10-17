export interface PaymentRecord {
  method: PaymentMethod;
  amount: number;
}

export type InvoiceItemType = "service" | "product" | "treatment" | "other";
export type PaymentMethod =
  | "cash"
  | "card"
  | "transfer"
  | "cod"
  | "combined"
  | "prepaid"
  | "debt";

export type InvoiceStatus =
  | "pending"
  | "paid"
  | "cancelled"
  | "refunded"
  | "partial";

export interface InvoiceItem {
  id: string; // ID của service, product...
  name: string;
  quantity: number;
  price_per_unit: number; // Giá tại thời điểm bán
  total_price: number;
  type: InvoiceItemType;
  discount_amount: number;
  /**
   * ID của lịch hẹn liên quan.
   * - Nếu là dịch vụ vừa thực hiện xong, đây là ID của lịch hẹn đó.
   * - Nếu là dịch vụ/sản phẩm mua trả trước, trường này sẽ là null.
   */
  appointment_id?: string | null;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  customer_id: string;
  appointment_id?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_records: PaymentRecord[];
  status: InvoiceStatus;
  shipping_address?: ShippingAddress;
  notes?: string;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}
