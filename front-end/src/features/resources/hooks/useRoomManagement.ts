// src/features/resources/hooks/useRoomManagement.ts
import { useResourceManagement } from "@/features/management-pages/hooks/useResourceManagement";
import { Room } from "@/features/resources/types";
import {
  RoomFormValues,
  roomFormSchema,
} from "@/features/resources/schemas/room.schema";
import {
  addRoom,
  updateRoom,
  deleteRoom,
} from "@/features/resources/apis/room.api";
import { useRooms } from "./useResources";

export function useRoomManagement() {
  return useResourceManagement<Room, RoomFormValues>({
    queryKey: ["rooms"],
    useDataHook: useRooms,
    addFn: addRoom,
    updateFn: updateRoom,
    deleteFn: deleteRoom,
    formSchema: roomFormSchema,
    defaultFormValues: {
      name: "",
      description: "",
    },
    getEditFormValues: (room) => ({
      name: room.name,
      description: room.description || "",
    }),
    customMessages: {
      addSuccess: "Thêm phòng thành công!",
      updateSuccess: "Cập nhật phòng thành công!",
      deleteSuccess: "Đã xóa phòng!",
    },
  });
}
