// src/lib/image-utils.ts
import { ImageUrl } from "@/features/shared/types";

/**
 * Lấy URL của ảnh chính từ một mảng các ảnh.
 * Ưu tiên ảnh có ID trùng với primaryImageId, nếu không có thì lấy ảnh đầu tiên.
 * @param images - Mảng các đối tượng ảnh (ImageUrl)
 * @param primaryImageId - ID của ảnh chính
 * @param placeholder - URL ảnh mặc định nếu không có ảnh nào
 * @returns URL của ảnh chính hoặc ảnh mặc định
 */
export const getPrimaryImageUrl = (
  images: ImageUrl[] | undefined,
  primaryImageId?: string | null,
  placeholder: string = "/images/placeholder.png"
): string => {
  if (!images || images.length === 0) {
    return placeholder;
  }

  if (primaryImageId) {
    const primaryImage = images.find((img) => img.id === primaryImageId);
    if (primaryImage) {
      return primaryImage.url;
    }
  }

  return images[0]?.url || placeholder;
};
