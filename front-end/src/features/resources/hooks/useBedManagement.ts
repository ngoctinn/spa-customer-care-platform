// src/features/resources/hooks/useBedManagement.ts
import { useResourceManagement } from "@/features/management-pages/hooks/useResourceManagement";
import { Bed } from "@/features/resources/types";
import {
  BedFormValues,
  bedFormSchema,
} from "@/features/resources/schemas/bed.schema";
import {
  addBed,
  updateBed,
  deleteBed,
} from "@/features/resources/apis/bed.api";
import { useBeds } from "./useResources";

export function useBedManagement() {
  return useResourceManagement<Bed, BedFormValues>({
    queryKey: ["beds"],
    useDataHook: useBeds,
    addFn: addBed,
    updateFn: updateBed,
    deleteFn: deleteBed,
    formSchema: bedFormSchema,
    defaultFormValues: {
      name: "",
      room_id: "",
    },
    getEditFormValues: (bed) => ({
      name: bed.name,
      room_id: bed.room_id,
    }),
    customMessages: {
      addSuccess: "Thêm giường thành công!",
      updateSuccess: "Cập nhật giường thành công!",
      deleteSuccess: "Đã xóa giường!",
    },
  });
}
