import { useQuery } from "@tanstack/react-query";
import { getTreatmentPlans } from "@/features/treatment/api/treatment.api";
import { TreatmentPlan } from "@/features/treatment/types";

export const useTreatmentPlans = () => {
  return useQuery<TreatmentPlan[]>({
    queryKey: ["treatmentPlans"],
    queryFn: getTreatmentPlans,
  });
};
