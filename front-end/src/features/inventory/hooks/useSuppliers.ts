// src/features/inventory/hooks/useSuppliers.ts
import { useQuery } from "@tanstack/react-query";
import { getSuppliers } from "@/features/inventory/apis/supplier.api"; // Giả sử API function đã được tạo

export const useSuppliers = () => {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: getSuppliers,
  });
};
