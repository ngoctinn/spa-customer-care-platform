// src/features/media/api/media.api.ts
import apiClient from "@/lib/apiClient";
import { MediaImage } from "@/features/media/types";

/**
 * Lấy danh sách tất cả ảnh từ thư viện media.
 * Giả sử endpoint là /media/images
 */
export async function getMediaImages(): Promise<MediaImage[]> {
  return apiClient<MediaImage[]>("/media/images");
}
