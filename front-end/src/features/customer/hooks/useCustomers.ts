// src/features/customer/hooks/useCustomers.ts
import { useQuery } from "@tanstack/react-query";
import {
  getCustomers,
  updateCustomerById,
  deactivateCustomer,
  getCustomerById, // ++ IMPORT HÀM MỚI ++
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

/**
 * ++ HOOK MỚI: Lấy thông tin chi tiết một khách hàng bằng ID. ++
 * @param customerId ID của khách hàng
 */
export const useCustomerById = (customerId: string) => {
  return useQuery<FullCustomerProfile>({
    queryKey: ["customers", customerId],
    queryFn: () => getCustomerById(customerId),
    enabled: !!customerId, // Chỉ chạy query khi customerId có giá trị
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
