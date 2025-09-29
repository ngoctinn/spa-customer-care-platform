import { TreatmentPlan } from "@/features/treatment/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const PLANS_API_URL = `${API_URL}/treatment-plans`;

export const getTreatmentPlans = async (): Promise<TreatmentPlan[]> => {
  try {
    const response = await fetch(PLANS_API_URL, { cache: "no-store" });
    if (!response.ok) throw new Error("Failed to fetch treatment plans.");
    return await response.json();
  } catch (error) {
    console.error("Error fetching treatment plans:", error);
    return [];
  }
};

export const getTreatmentPlanById = async (
  id: string
): Promise<TreatmentPlan | null> => {
  try {
    const response = await fetch(`${PLANS_API_URL}/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error("Failed to fetch treatment plan.");
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching treatment plan with id ${id}:`, error);
    return null;
  }
};
