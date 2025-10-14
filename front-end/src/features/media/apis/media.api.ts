// src/features/media/api/media.api.ts
import apiClient from "@/lib/apiClient";
import { MediaImage } from "@/features/media/types";

/**
 * Lấy danh sách tất cả ảnh từ thư viện media.
 * Giả sử endpoint là /media/images
 */
export async function getMediaImages(
  scope: "catalog" | "personal" = "personal"
): Promise<MediaImage[]> {
  return apiClient<MediaImage[]>(`/images?scope=${scope}`);
}

/**
 *  Xóa một ảnh khỏi thư viện media. ++
 * @param imageId ID của ảnh cần xóa.
 */
export async function deleteMediaImage(imageId: string): Promise<void> {
  return apiClient<void>(`/images/${imageId}`, {
    method: "DELETE",
  });
}
