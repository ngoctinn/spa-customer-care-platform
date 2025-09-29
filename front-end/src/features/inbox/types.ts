import { UUID } from "crypto";

export interface Message {
  id: UUID;
  sender: "customer" | "staff" | "bot";
  text: string;
  created_at: Date;
}

export interface Conversation {
  id: UUID;
  customer_id: UUID;
  last_message: string;
  is_read_by_staff: boolean;
  messages: Message[];
  created_at: Date;
  updated_at: Date;
}
