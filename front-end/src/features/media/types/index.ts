// src/features/media/types/index.ts

/**
 * @description Đại diện cho cấu trúc dữ liệu của một ảnh trong thư viện media.
 */
export interface MediaImage {
  id: string;
  url: string;
  alt_text?: string;
  uploaded_at?: string; // ISO 8601 date string
}

/**
 * @description Props cho component chính, cho phép tích hợp vào các form.
 */
export interface FeaturedImageUploaderProps {
  value: MediaImage | null;
  onSelect: (image: MediaImage | null) => void;
}

/**
 * @description Trạng thái của một file đang được tải lên.
 */
export interface UploadingFile {
  id: string; // ID tạm thời ở client
  file: File;
  progress: number; // 0-100
  status: "uploading" | "success" | "error";
}
