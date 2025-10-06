"use client";

import { ImageUrl } from "@/features/shared/types";
import { useQuery } from "@tanstack/react-query";

import {
  FetchImageLibraryParams,
  fetchImageLibrary,
} from "../upload.api";

type UseImageLibraryOptions = {
  enabled?: boolean;
};

/**
 * Hook tiện ích để lấy danh sách hình ảnh trong thư viện dùng chung.
 */
export function useImageLibrary(
  params?: FetchImageLibraryParams,
  options: UseImageLibraryOptions = {}
) {
  return useQuery<ImageUrl[]>({
    queryKey: ["image-library", params],
    queryFn: () => fetchImageLibrary(params),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    enabled: options.enabled ?? true,
  });
}

