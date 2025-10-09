// src/features/media/hooks/useMedia.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMediaImages } from "@/features/media/apis/media.api";
import { uploadFile } from "@/features/media/apis/upload.api";
import { MediaImage } from "@/features/media/types";

// Key chung cho query media
const queryKey = ["mediaImages"];

/**
 * Hook để lấy danh sách ảnh từ thư viện media.
 */
export const useMediaImages = () => {
  return useQuery<MediaImage[]>({
    queryKey: queryKey,
    queryFn: getMediaImages,
  });
};

/**
 * Hook để xử lý việc tải một file ảnh lên server.
 */
export const useUploadImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadFile(file),
    onSuccess: () => {
      // Tự động làm mới lại danh sách media sau khi upload thành công
      queryClient.invalidateQueries({ queryKey: queryKey });
    },
    // onError có thể được xử lý trực tiếp tại component để cập nhật UI
  });
};
