import { UUID } from "crypto";

export interface ImageUrl {
  id: UUID;
  url: string;
  is_primary: boolean;
  alt_text?: string;
}
