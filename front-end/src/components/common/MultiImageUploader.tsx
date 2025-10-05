// src/components/common/MultiImageUploader.tsx
"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UploadCloud, X } from "lucide-react";
import Image from "next/image";
import { ImageUrl } from "@/features/shared/types";
import { v4 as uuidv4 } from "uuid";

interface MultiImageUploaderProps {
  onFilesSelect: (files: File[]) => void;
  value?: (File | ImageUrl)[];
  onRemoveImage: (image: File | ImageUrl) => void;
}

export const MultiImageUploader = ({
  onFilesSelect,
  value = [],
  onRemoveImage,
}: MultiImageUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelection = (selectedFiles: FileList | null) => {
    if (selectedFiles) {
      onFilesSelect(Array.from(selectedFiles));
    }
  };

  const handleRemoveClick = (image: File | ImageUrl) => {
    onRemoveImage(image);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFileSelection(event.dataTransfer.files);
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileSelection(e.target.files)}
        className="hidden"
        accept="image/png, image/jpeg, image/gif"
        multiple
      />
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "mt-1 border-2 border-dashed border-border rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors",
          isDragging && "border-primary bg-muted/50"
        )}
      >
        <div className="text-muted-foreground text-center">
          <UploadCloud className="text-3xl mb-2 mx-auto" />
          <p>Nhấp hoặc kéo thả ảnh vào đây</p>
        </div>
      </div>

      {value.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {value.map((image) => {
            // Xác định URL và alt text dựa trên loại đối tượng
            const imageUrl =
              image instanceof File ? URL.createObjectURL(image) : image.url;
            const altText =
              image instanceof File
                ? image.name
                : image.alt_text ?? "Xem trước";
            // Tạo key duy nhất
            const key = image instanceof File ? uuidv4() : image.id;

            return (
              <div key={key} className="relative group aspect-square">
                <Image
                  src={imageUrl}
                  alt={altText}
                  fill
                  className="object-cover rounded-md"
                  // Clean up blob URL khi component unmount để tránh memory leak
                  onLoad={() => {
                    if (image instanceof File) {
                      URL.revokeObjectURL(imageUrl);
                    }
                  }}
                />
                <div className="absolute top-1 right-1">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-6 w-6 opacity-70 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveClick(image)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
