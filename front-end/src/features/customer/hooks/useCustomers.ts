// src/features/customer/hooks/useCustomers.ts
import { useQuery } from "@tanstack/react-query";
import {
  getCustomers,
  updateCustomerById,
  deactivateCustomer, // Giả sử có hàm này
} from "@/features/customer/api/customer.api";
import { FullCustomerProfile } from "@/features/customer/types";
import { useCrudMutations } from "@/hooks/useCrudMutations";

const queryKey = ["customers"];

export const useCustomers = () => {
  return useQuery<FullCustomerProfile[]>({
    queryKey: queryKey,
    queryFn: getCustomers,
  });
};

// ++ TẠO CUSTOMER MUTATIONS ++
export const useCustomerMutations = () => {
  // Vì không có hàm "add", ta truyền một hàm giả
  const fakeAdd = async () => Promise.resolve();

  return useCrudMutations<
    FullCustomerProfile,
    any,
    Partial<{ full_name: string; phone: string; notes: string }>
  >(
    queryKey,
    fakeAdd,
    (vars: {
      id: string;
      data: Partial<{ full_name: string; phone: string; notes: string }>;
    }) => updateCustomerById(vars.id, vars.data),
    deactivateCustomer,
    {
      updateSuccess: "Cập nhật thông tin khách hàng thành công!",
      deleteSuccess: "Đã vô hiệu hóa khách hàng!",
    }
  );
};
