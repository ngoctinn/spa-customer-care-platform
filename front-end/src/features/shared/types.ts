export interface ImageUrl {
  id: string;
  url: string;
  alt_text?: string | null;
  product_ids?: string[];
  service_ids?: string[];
  treatment_plan_ids?: string[];
}
