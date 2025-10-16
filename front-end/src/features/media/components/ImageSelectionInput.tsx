// src/features/media/components/ImageSelectionInput.tsx
"use client";

import { MediaImage as ImageUrl } from "@/features/media/types";
import { FeaturedImageInput } from "./FeaturedImageInput";
import { MultipleImageInput } from "./MultipleImageInput";

interface ImageSelectionInputProps {
  value: ImageUrl[];
  onChange: (images: ImageUrl[]) => void;
  maxImages?: number;
}

export function ImageSelectionInput({
  value = [],
  onChange,
  maxImages = 10,
}: ImageSelectionInputProps) {
  // Chế độ chọn 1 ảnh (giao diện của FeaturedImageUploader cũ)
  if (maxImages === 1) {
    return (
      <FeaturedImageInput
        value={value?.[0] || null}
        onChange={(image) => onChange(image ? [image] : [])}
      />
    );
  }

  // Chế độ chọn nhiều ảnh
  return (
    <MultipleImageInput
      value={value}
      onChange={onChange}
      maxImages={maxImages}
    />
  );
}
