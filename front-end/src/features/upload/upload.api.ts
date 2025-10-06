// src/features/upload/upload.api.ts
import { ImageUrl } from "@/features/shared/types";

// Endpoint mới cho dịch vụ upload hình ảnh dùng chung
const UPLOAD_ENDPOINT = "/images";

type UploadImageOptions = {
  altText?: string;
  productIds?: string[];
  serviceIds?: string[];
  treatmentPlanIds?: string[];
};

/**
 * Tải một file lên server.
 * @param file Đối tượng File cần tải lên.
 * @returns Promise chứa thông tin ảnh đã được tải lên (ImageUrl).
 */
export async function uploadFile(
  file: File,
  options: UploadImageOptions = {}
): Promise<ImageUrl> {
  const formData = new FormData();
  formData.append("file", file);

  if (options.altText) {
    formData.append("alt_text", options.altText);
  }

  options.productIds?.forEach((id) =>
    formData.append("product_ids", id)
  );
  options.serviceIds?.forEach((id) => formData.append("service_ids", id));
  options.treatmentPlanIds?.forEach((id) =>
    formData.append("treatment_plan_ids", id)
  );

  // Chúng ta không dùng apiClient gốc vì nó mặc định gửi JSON.
  // Thay vào đó, tạo một yêu cầu fetch riêng cho multipart/form-data.
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  const response = await fetch(`${API_URL}${UPLOAD_ENDPOINT}`, {
    method: "POST",
    body: formData,
    // Không cần set 'Content-Type', trình duyệt sẽ tự động làm điều đó
    // với boundary chính xác khi bạn dùng FormData.
    credentials: "include", // Giữ lại để xử lý cookie xác thực
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Upload file thất bại.");
  }

  return response.json();
}
