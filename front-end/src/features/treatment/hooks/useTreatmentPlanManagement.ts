// src/features/treatment/hooks/useTreatmentPlanManagement.ts
import { useResourceManagement } from "@/features/management-pages/hooks/useResourceManagement";
import { useTreatmentPlans } from "./useTreatmentPlans";
import { TreatmentPlan } from "../types";
import { TreatmentPlanFormValues, treatmentPlanFormSchema } from "../schemas";
import {
  addTreatmentPlan,
  updateTreatmentPlan,
  deleteTreatmentPlan,
} from "../apis/treatment.api";

export function useTreatmentPlanManagement() {
  return useResourceManagement<TreatmentPlan, TreatmentPlanFormValues>({
    queryKey: ["treatmentPlans"],
    useDataHook: useTreatmentPlans,
    addFn: addTreatmentPlan,
    updateFn: (vars) =>
      updateTreatmentPlan({ planId: vars.id, planData: vars.data }),
    deleteFn: deleteTreatmentPlan,
    formSchema: treatmentPlanFormSchema,
    defaultFormValues: {
      name: "",
      description: "",
      category_ids: [],
      price: 0,
      steps: [{ serviceId: "" }],
      images: [],
    },
    getEditFormValues: (plan) => ({
      ...plan,
      category_ids: plan.categories ? plan.categories.map((c) => c.id) : [],
      steps: plan.steps.map((s) => ({
        serviceId: s.service_id,
        description: s.description || "",
      })),
    }),
    customMessages: {
      addSuccess: "Thêm liệu trình thành công!",
      updateSuccess: "Cập nhật liệu trình thành công!",
      deleteSuccess: "Đã xóa liệu trình!",
    },
  });
}
