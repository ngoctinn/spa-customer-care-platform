// src/lib/image-utils.ts
import { MediaImage as ImageUrl } from "@/features/media/types";

/**
 * Lấy URL của ảnh chính từ một mảng các ảnh theo logic ưu tiên.
 * 1. Ưu tiên ảnh có ID trùng với primaryImageId.
 * 2. Nếu không có, lấy ảnh đầu tiên trong mảng.
 * 3. Nếu không có ảnh nào, trả về ảnh mặc định.
 * @param images - Mảng các đối tượng ảnh (ImageUrl)
 * @param primaryImageId - (Tùy chọn) ID của ảnh được đánh dấu là ảnh chính
 * @param placeholder - (Tùy chọn) URL ảnh mặc định nếu không có ảnh nào
 * @returns URL của ảnh chính hoặc ảnh mặc định
 */
export const getPrimaryImageUrl = (
  images: ImageUrl[] | undefined,
  primaryImageId?: string | null,
  placeholder: string = "/images/placeholder.png"
): string => {
  // Trường hợp cuối cùng: Mảng không tồn tại hoặc rỗng
  if (!images || images.length === 0) {
    return placeholder;
  }

  // Ưu tiên hàng đầu: Tìm ảnh theo primaryImageId
  if (primaryImageId) {
    const primaryImage = images.find((img) => img.id === primaryImageId);
    if (primaryImage) {
      return primaryImage.url;
    }
  }

  // Ưu tiên thứ hai (Fallback): Lấy ảnh đầu tiên trong mảng
  // Dùng `?.url` để phòng trường hợp object ảnh đầu tiên không có url
  return images[0]?.url || placeholder;
};
