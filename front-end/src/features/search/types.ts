import { Product } from "@/features/product/types";
import { Service } from "@/features/service/types";
import { TreatmentPlan } from "@/features/treatment/types";

// Kiểu dữ liệu cho kết quả tìm kiếm tổng hợp từ API
export interface SearchResults {
  services: Service[];
  products: Product[];
  treatmentPlans: TreatmentPlan[];
}

// Kiểu dữ liệu cho một danh sách kết quả cụ thể để render
export type SearchResultListProps = {
  title: string;
  items: (Service | Product | TreatmentPlan)[];
  itemType: "service" | "product" | "treatment";
};
