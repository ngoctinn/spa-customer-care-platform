import { DataStateMessage } from "@/components/common/DataStateMessage";
import { Input } from "@/components/ui/input";
import { getTreatmentPlans } from "@/features/treatment/api/treatment.api";
import TreatmentPlanCard from "@/features/treatment/components/TreatmentPlanCard";
import type { TreatmentPlan } from "@/features/treatment/types";

export default async function TreatmentPlansPage() {
  let errorMessage: string | null = null;
  let treatmentPlans: TreatmentPlan[] = [];

  try {
    treatmentPlans = await getTreatmentPlans();
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : "Không thể tải danh sách liệu trình.";
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Khám Phá Các Gói Liệu Trình
        </h1>
        <p className="text-muted-foreground mt-2 mx-auto max-w-2xl">
          Đầu tư vào vẻ đẹp dài lâu với các gói liệu trình chuyên sâu, được
          thiết kế để mang lại hiệu quả tối ưu.
        </p>
      </header>

      <div className="mx-auto mb-8 max-w-md">
        <Input
          type="search"
          placeholder="Tìm kiếm liệu trình (ví dụ: triệt lông, phục hồi da...)"
          className="w-full"
          readOnly
        />
      </div>

      {errorMessage ? (
        <DataStateMessage
          variant="error"
          message="Không thể tải danh sách liệu trình"
          description={errorMessage}
          className="mx-auto max-w-xl"
        />
      ) : treatmentPlans.length === 0 ? (
        <DataStateMessage
          message="Hiện chưa có liệu trình nào được cập nhật."
          className="mx-auto max-w-xl"
        />
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {treatmentPlans.map((plan) => (
            <TreatmentPlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}
    </div>
  );
}
