// Gợi ý: Tạo file src/features/customer/hooks/useCustomers.ts
import { useQuery } from "@tanstack/react-query";
import { getCustomers } from "@/features/customer/api/customer.api";
import { FullCustomerProfile } from "@/features/customer/types";

export const useCustomers = () => {
  return useQuery<FullCustomerProfile[]>({
    queryKey: ["customers"],
    queryFn: getCustomers,
  });
};
