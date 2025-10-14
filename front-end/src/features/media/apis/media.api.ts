import apiClient from "@/lib/apiClient";
import { MediaImage } from "@/features/media/types";

/**
 * Lấy danh sách ảnh từ thư viện media theo phạm vi.
 */
export async function getMediaImages(
  scope: "catalog" | "personal" = "personal"
): Promise<MediaImage[]> {
  return apiClient<MediaImage[]>(`/images?scope=${scope}`);
}

/**
 * Xóa một ảnh khỏi thư viện media.
 * @param imageId ID của ảnh cần xóa.
 */
export async function deleteMediaImage(imageId: string): Promise<void> {
  return apiClient<void>(`/images/${imageId}`, {
    method: "DELETE",
  });
}
