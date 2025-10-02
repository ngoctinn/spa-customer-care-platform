// src/lib/image-utils.ts
import { ImageUrl } from "@/features/shared/types";

/**
 * Lấy URL của ảnh chính từ một mảng các ảnh.
 * Ưu tiên ảnh có is_primary = true, nếu không có thì lấy ảnh đầu tiên.
 * @param images - Mảng các đối tượng ảnh (ImageUrl)
 * @param placeholder - URL ảnh mặc định nếu không có ảnh nào
 * @returns URL của ảnh chính hoặc ảnh mặc định
 */
export const getPrimaryImageUrl = (
  images: ImageUrl[] | undefined,
  placeholder: string = "/images/placeholder.png"
): string => {
  if (!images || images.length === 0) {
    return placeholder;
  }
  const primaryImage = images.find((img) => img.is_primary);
  return primaryImage?.url || images[0]?.url || placeholder;
};
