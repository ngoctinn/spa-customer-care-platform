// src/features/treatment/hooks/useTreatmentPlans.ts
import { useQuery } from "@tanstack/react-query";
import {
  getTreatmentPlans,
  addTreatmentPlan,
  updateTreatmentPlan,
  deleteTreatmentPlan,
} from "@/features/treatment/apis/treatment.api";
import { TreatmentPlan } from "@/features/treatment/types";
import { useCrudMutations } from "@/features/management-pages/hooks/useCrudMutations"; // Import hook CRUD chung
import { TreatmentPlanFormValues } from "@/features/treatment/schemas";

const queryKey = ["treatmentPlans"];

export const useTreatmentPlans = () => {
  const { data, isLoading, isError, error } = useQuery<TreatmentPlan[]>({
    queryKey: queryKey,
    queryFn: () => getTreatmentPlans(),
  });
  return { data, isLoading, isError, error };
};

// ++ THÊM HOOK MUTATIONS MỚI ++
export const useTreatmentPlanMutations = () => {
  return useCrudMutations<
    TreatmentPlan,
    TreatmentPlanFormValues,
    Partial<TreatmentPlanFormValues>
  >(
    queryKey,
    addTreatmentPlan,
    (vars: { id: string; data: Partial<TreatmentPlanFormValues> }) =>
      updateTreatmentPlan({ planId: vars.id, planData: vars.data }),
    deleteTreatmentPlan,
    {
      addSuccess: "Thêm liệu trình thành công!",
      updateSuccess: "Cập nhật liệu trình thành công!",
      deleteSuccess: "Đã xóa liệu trình!",
    }
  );
};
