// src/features/customer/api/debt.api.ts
import apiClient from "@/lib/apiClient";
import { DebtHistoryTransaction } from "@/features/customer/types";

export const getDebtHistory = async (
  customerId: string
): Promise<DebtHistoryTransaction[]> => {
  return apiClient(`/customers/${customerId}/debt-history`);
};
