// src/features/inventory/hooks/useSupplierManagement.ts
import { useResourceManagement } from "@/features/management-pages/hooks/useResourceManagement";
import { useSuppliers } from "./useSuppliers";
import { Supplier } from "../types";
import {
  SupplierFormValues,
  supplierFormSchema,
} from "@/features/inventory/schemas/supplier.schema";
import {
  addSupplier,
  updateSupplier,
  deleteSupplier,
} from "@/features/inventory/apis/supplier.api";

export function useSupplierManagement() {
  return useResourceManagement<Supplier, SupplierFormValues>({
    queryKey: ["suppliers"],
    useDataHook: useSuppliers,
    addFn: addSupplier,
    updateFn: updateSupplier,
    deleteFn: deleteSupplier,
    formSchema: supplierFormSchema,
    defaultFormValues: {
      name: "",
      contact_person: "",
      phone: "",
      email: "",
      address: "",
    },
    getEditFormValues: (supplier) => supplier,
    customMessages: {
      addSuccess: "Thêm nhà cung cấp thành công!",
      updateSuccess: "Cập nhật nhà cung cấp thành công!",
      deleteSuccess: "Đã xóa nhà cung cấp!",
    },
  });
}
