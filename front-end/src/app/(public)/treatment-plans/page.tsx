import { getTreatmentPlans } from "@/features/treatment/api/treatment.api";
import TreatmentPlanCard from "@/features/treatment/components/TreatmentPlanCard";
import { Input } from "@/components/ui/input";

export default async function TreatmentPlansPage() {
  const treatmentPlans = await getTreatmentPlans();

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight">
          Khám Phá Các Gói Liệu Trình
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Đầu tư vào vẻ đẹp dài lâu với các gói liệu trình chuyên sâu, được
          thiết kế để mang lại hiệu quả tối ưu.
        </p>
      </header>

      <div className="mb-8 max-w-md mx-auto">
        <Input
          type="search"
          placeholder="Tìm kiếm liệu trình (ví dụ: triệt lông, phục hồi da...)"
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {treatmentPlans.map((plan) => (
          <TreatmentPlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    </div>
  );
}
