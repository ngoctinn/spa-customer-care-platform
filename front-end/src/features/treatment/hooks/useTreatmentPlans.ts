import { useQuery } from "@tanstack/react-query";
import { getTreatmentPlans } from "@/features/treatment/api/treatment.api";
import { TreatmentPlan } from "@/features/treatment/types";

export const useTreatmentPlans = () => {
  const { data, isLoading, isError, error } = useQuery<TreatmentPlan[]>({
    queryKey: ["treatmentPlans"],
    queryFn: () => getTreatmentPlans(),
  });
  return { data, isLoading, isError, error };
};
