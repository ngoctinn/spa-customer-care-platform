// src/features/media/components/FeaturedImageInput.tsx
"use client";

import Image from "next/image";
import { Edit, ImageIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMediaLibrary } from "@/features/media/stores/use-media-library-store";
import { MediaImage as ImageUrl } from "@/features/media/types";

interface FeaturedImageInputProps {
  value: ImageUrl | null;
  onChange: (image: ImageUrl | null) => void;
}

export function FeaturedImageInput({
  value,
  onChange,
}: FeaturedImageInputProps) {
  const { onOpen } = useMediaLibrary();

  const handleMediaSelect = (images: ImageUrl[]) => {
    onChange(images[0] || null);
  };

  const openMediaModal = () => {
    onOpen({
      onSelect: handleMediaSelect,
      maxImages: 1,
    });
  };

  return (
    <Card>
      <CardContent className="p-4">
        {value ? (
          <div className="relative group">
            <Image
              src={value.url}
              alt={value.alt_text || "Featured Image"}
              width={400}
              height={400}
              className="w-full h-auto aspect-video object-cover rounded-md"
            />
            <div className="absolute inset-0 bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={openMediaModal}
                type="button"
              >
                <Edit className="mr-2 h-4 w-4" />
                Thay đổi
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onChange(null)}
                type="button"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa ảnh
              </Button>
            </div>
          </div>
        ) : (
          <div
            onClick={openMediaModal}
            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <ImageIcon className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-sm font-semibold">Chọn ảnh đại diện</p>
            <p className="text-xs text-muted-foreground">
              Nhấp để chọn từ thư viện hoặc tải lên ảnh mới
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
