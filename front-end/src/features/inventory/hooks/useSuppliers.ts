// src/features/inventory/hooks/useSuppliers.ts
import { useQuery } from "@tanstack/react-query";
import {
  getSuppliers,
  getSupplierById,
} from "@/features/inventory/apis/supplier.api"; // Giả sử API function đã được tạo
import { Supplier } from "../types"; // ++ IMPORT SUPPLIER TYPE ++

export const useSuppliers = () => {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: getSuppliers,
  });
};

/**
 * ++ HOOK MỚI: Lấy chi tiết nhà cung cấp bằng ID. ++
 */
export const useSupplierById = (supplierId: string) => {
  return useQuery<Supplier>({
    queryKey: ["suppliers", supplierId],
    queryFn: () => getSupplierById(supplierId),
    enabled: !!supplierId,
  });
};
