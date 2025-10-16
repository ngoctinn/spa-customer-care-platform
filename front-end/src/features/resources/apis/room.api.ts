// src/features/resources/api/room.api.ts
import apiClient from "@/lib/apiClient";
import { Room } from "@/features/resources/types";
import { RoomFormValues } from "@/features/resources/schemas/room.schema";

/**
 * Lấy danh sách tất cả các phòng
 */
export async function getRooms(): Promise<Room[]> {
  // Giả sử endpoint là /resources/rooms
  return apiClient<Room[]>("/resources/rooms");
}

/**
 * Thêm một phòng mới
 */
export async function addRoom(data: RoomFormValues): Promise<Room> {
  return apiClient<Room>("/resources/rooms", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Cập nhật thông tin một phòng
 */
export async function updateRoom({
  id,
  data,
}: {
  id: string;
  data: Partial<RoomFormValues>;
}): Promise<Room> {
  return apiClient<Room>(`/resources/rooms/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Xóa một phòng
 */
export async function deleteRoom(id: string): Promise<void> {
  return apiClient<void>(`/resources/rooms/${id}`, {
    method: "DELETE",
  });
}
