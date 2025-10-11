import ProductCard from "@/features/product/components/ProductCard";
import ServiceCard from "@/features/service/components/ServiceCard";
import TreatmentPlanCard from "@/features/treatment/components/TreatmentPlanCard";
import { Product } from "@/features/product/types";
import { Service } from "@/features/service/types";
import { TreatmentPlan } from "@/features/treatment/types";
import { Separator } from "@/components/ui/separator";

// Kiểu dữ liệu cho props của component
type SearchResultListProps = {
  title: string;
  items: (Service | Product | TreatmentPlan)[];
  itemType: "service" | "product" | "treatment";
};

export function SearchResultList({
  title,
  items,
  itemType,
}: SearchResultListProps) {
  const renderItem = (item: any) => {
    switch (itemType) {
      case "service":
        return <ServiceCard service={item as Service} />;
      case "product":
        return <ProductCard product={item as Product} />;
      case "treatment":
        return <TreatmentPlanCard plan={item as TreatmentPlan} />;
      default:
        return null;
    }
  };

  return (
    <section>
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <Separator className="flex-1" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {items.map((item) => (
          <div key={item.id}>{renderItem(item)}</div>
        ))}
      </div>
    </section>
  );
}
