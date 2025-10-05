// src/features/product/api/product.api.ts
import { Product } from "@/features/product/types";
import apiClient from "@/lib/apiClient";
import { ProductFormValues } from "@/features/product/schemas";
import { ImageUrl } from "@/features/shared/types";
import { uploadFile } from "@/features/upload/upload.api";

/**
 * Xử lý upload các file mới và trả về danh sách ImageUrl hoàn chỉnh.
 * @param images Mảng chứa cả File (ảnh mới) và ImageUrl (ảnh cũ).
 * @returns Danh sách ImageUrl đã được xử lý.
 */
async function handleImageUploads(
  images: (File | ImageUrl)[] | undefined
): Promise<ImageUrl[]> {
  if (!images || images.length === 0) {
    return [];
  }

  const uploadPromises: Promise<ImageUrl>[] = [];
  const existingImages: ImageUrl[] = [];

  images.forEach((image) => {
    if (image instanceof File) {
      // Nếu là file mới, thêm vào danh sách chờ upload
      uploadPromises.push(uploadFile(image));
    } else {
      // Nếu là ảnh đã có, giữ lại
      existingImages.push(image);
    }
  });

  // Chờ tất cả các file được upload xong
  const uploadedImages = await Promise.all(uploadPromises);

  // Kết hợp ảnh cũ và ảnh mới đã upload
  return [...existingImages, ...uploadedImages];
}

/**
 * Thêm một sản phẩm mới
 * @param productData Dữ liệu sản phẩm từ form
 */
export async function addProduct(
  productData: ProductFormValues
): Promise<Product> {
  const { images, ...otherData } = productData;
  const processedImages = await handleImageUploads(images);
  const payload = {
    ...otherData,
    images: processedImages,
  };
  return apiClient<Product>("/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Cập nhật thông tin một sản phẩm
 * @param productId ID của sản phẩm cần cập nhật
 * @param productData Dữ liệu cập nhật từ form
 */
export async function updateProduct({
  productId,
  productData,
}: {
  productId: string;
  productData: Partial<ProductFormValues>;
}): Promise<Product> {
  const { images, ...otherData } = productData;
  const processedImages = await handleImageUploads(images);
  const payload = {
    ...otherData,
    images: processedImages,
  };
  return apiClient<Product>(`/products/${productId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * Lấy danh sách tất cả sản phẩm
 */
export async function getProducts(): Promise<Product[]> {
  return apiClient<Product[]>("/products");
}

/**
 * Lấy thông tin chi tiết một sản phẩm bằng ID
 * @param id ID của sản phẩm
 */
export async function getProductById(id: string): Promise<Product> {
  return apiClient<Product>(`/products/${id}`);
}

/**
 * Xóa (vô hiệu hóa) một sản phẩm
 * @param productId ID của sản phẩm cần xóa
 */
export async function deleteProduct(productId: string): Promise<void> {
  return apiClient<void>(`/products/${productId}`, {
    method: "DELETE",
  });
}
