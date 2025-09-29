import { UUID } from "crypto";

export type PrepaidCardTransactionType = "deposit" | "payment" | "refund";

export interface PrepaidCardTransaction {
  id: UUID;
  type: PrepaidCardTransactionType;
  amount: number;
  description: string;
  related_invoice_id?: UUID;
  created_at: Date;
}

export interface PrepaidCard {
  id: UUID;
  customer_id: UUID;
  card_number_last4: string; // Chỉ lưu 4 số cuối
  balance: number;
  initial_balance: number;
  history: PrepaidCardTransaction[];
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}
