// src/features/customer/hooks/useDebt.ts
import { useQuery } from "@tanstack/react-query";
import { getDebtHistory } from "@/features/customer/api/debt.api";
import { DebtHistoryTransaction } from "@/features/customer/types";

export const useDebtHistory = (customerId: string) => {
  return useQuery<DebtHistoryTransaction[]>({ 
    queryKey: ["debtHistory", customerId],
    queryFn: () => getDebtHistory(customerId),
    enabled: !!customerId,
  });
};
