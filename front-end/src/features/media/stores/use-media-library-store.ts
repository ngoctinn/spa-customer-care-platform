// src/features/media/stores/use-media-library-store.ts

import { create } from "zustand";
import type { MediaImage } from "@/features/media/types";

// Định nghĩa kiểu cho callback onSelect, giờ đây sẽ nhận một mảng ảnh
type OnSelectCallback = (images: MediaImage[]) => void;

interface MediaLibraryState {
  isOpen: boolean;
  onSelect: OnSelectCallback;
  maxImages: number;
  // Cập nhật onOpen để nhận cấu hình lựa chọn ảnh
  onOpen: (config: { onSelect: OnSelectCallback; maxImages?: number }) => void;
  onClose: () => void;
}

export const useMediaLibrary = create<MediaLibraryState>((set) => ({
  isOpen: false,
  onSelect: () => {}, // Callback mặc định
  maxImages: 1, // Mặc định chọn 1 ảnh
  onOpen: ({ onSelect, maxImages = 1 }) =>
    set({ isOpen: true, onSelect, maxImages }), // Lưu callback và maxImages vào state
  onClose: () => set({ isOpen: false }),
}));
