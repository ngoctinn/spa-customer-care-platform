// src/stores/use-media-library-store.ts

import { create } from "zustand";

interface MediaLibraryState {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useMediaLibrary = create<MediaLibraryState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
