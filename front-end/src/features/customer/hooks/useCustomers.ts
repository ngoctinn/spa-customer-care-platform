// src/features/customer/hooks/useCustomers.ts
// src/features/customer/hooks/useCustomers.ts
import { useQuery } from "@tanstack/react-query";
import {
  getCustomers,
  updateCustomerById,
  deactivateCustomer,
  getCustomerById,
  addCustomer, // ++ IMPORT HÀM MỚI ++
} from "@/features/customer/api/customer.api";
import { FullCustomerProfile } from "@/features/customer/types";
import { useCrudMutations } from "@/hooks/useCrudMutations";
import { CustomerFormValues } from "./useCustomerManagement";

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
  return useCrudMutations<
    FullCustomerProfile,
    CustomerFormValues,
    Partial<CustomerFormValues>
  >(
    queryKey,
    addCustomer, // <-- THAY THẾ HÀM GIẢ
    (vars: { id: string; data: Partial<CustomerFormValues> }) =>
      updateCustomerById(vars.id, vars.data),
    deactivateCustomer,
    {
      addSuccess: "Thêm khách hàng thành công!",
      updateSuccess: "Cập nhật thông tin khách hàng thành công!",
      deleteSuccess: "Đã vô hiệu hóa khách hàng!",
    }
  );
};
