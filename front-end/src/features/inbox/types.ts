export interface Message {
  id: string;
  sender: "customer" | "staff" | "bot";
  text: string;
  created_at: Date;
}

export interface Conversation {
  id: string;
  customer_id: string;
  last_message: string;
  is_read_by_staff: boolean;
  messages: Message[];
  created_at: Date;
  updated_at: Date;
}
