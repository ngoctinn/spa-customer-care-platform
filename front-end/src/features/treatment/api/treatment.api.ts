import { TreatmentPlan } from "@/features/treatment/types";
import apiClient from "@/lib/apiClient";

export const getTreatmentPlans = async (): Promise<TreatmentPlan[]> => {
  return apiClient<TreatmentPlan[]>("/treatment-plans");
};

export const getTreatmentPlanById = async (
  id: string
): Promise<TreatmentPlan> => {
  return apiClient<TreatmentPlan>(`/treatment-plans/${id}`);
};
