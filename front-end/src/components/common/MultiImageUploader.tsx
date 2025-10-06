// src/components/common/MultiImageUploader.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Check, Images, Loader2, UploadCloud, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ImageUrl } from "@/features/shared/types";
import { useImageLibrary } from "@/features/upload/hooks/useImageLibrary";
import { cn } from "@/lib/utils";

interface MultiImageUploaderProps {
  onFilesSelect: (files: File[]) => void;
  value?: (File | ImageUrl)[];
  onRemoveImage: (image: File | ImageUrl) => void;
  onLibrarySelectionChange?: (images: ImageUrl[]) => void;
}

export const MultiImageUploader = ({
  onFilesSelect,
  value = [],
  onRemoveImage,
  onLibrarySelectionChange,
}: MultiImageUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [selectedLibraryIds, setSelectedLibraryIds] = useState<Set<string>>(
    new Set()
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const existingLibraryIds = useMemo(
    () =>
      value
        .filter((image): image is ImageUrl => !(image instanceof File))
        .map((image) => image.id),
    [value]
  );

  useEffect(() => {
    if (isLibraryOpen) {
      setSelectedLibraryIds(new Set(existingLibraryIds));
    }
  }, [isLibraryOpen, existingLibraryIds]);

  const {
    data: libraryImages = [],
    isLoading: isLibraryLoading,
    isError: isLibraryError,
    error: libraryError,
    refetch: refetchLibrary,
  } = useImageLibrary(undefined, { enabled: isLibraryOpen });

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

  const toggleLibrarySelection = (imageId: string) => {
    setSelectedLibraryIds((prev) => {
      const next = new Set(prev);
      if (next.has(imageId)) {
        next.delete(imageId);
      } else {
        next.add(imageId);
      }
      return next;
    });
  };

  const handleConfirmLibrarySelection = () => {
    if (!onLibrarySelectionChange) {
      setIsLibraryOpen(false);
      return;
    }

    const selectedImages = libraryImages.filter((image) =>
      selectedLibraryIds.has(image.id)
    );

    onLibrarySelectionChange(selectedImages);
    setIsLibraryOpen(false);
  };

  const handleLibraryOpenChange = (open: boolean) => {
    setIsLibraryOpen(open);
    if (!open) {
      setSelectedLibraryIds(new Set());
    }
  };

  const libraryErrorMessage =
    libraryError instanceof Error
      ? libraryError.message
      : "Không thể tải thư viện hình ảnh.";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Chọn ảnh từ thư viện trước khi tải ảnh mới từ máy của bạn.
        </p>
        <Dialog open={isLibraryOpen} onOpenChange={handleLibraryOpenChange}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline">
              <Images className="mr-2 h-4 w-4" />
              Mở thư viện ảnh
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>Thư viện hình ảnh</DialogTitle>
              <DialogDescription>
                Đánh dấu những ảnh bạn muốn sử dụng. Bạn có thể tải thêm ảnh
                mới sau khi lựa chọn.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              {isLibraryLoading ? (
                <div className="flex h-48 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : isLibraryError ? (
                <div className="flex flex-col items-center gap-3 text-center">
                  <p className="text-sm text-destructive">{libraryErrorMessage}</p>
                  <Button onClick={() => refetchLibrary()} variant="outline">
                    Thử lại
                  </Button>
                </div>
              ) : libraryImages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center">
                  Thư viện hiện chưa có hình ảnh nào.
                </p>
              ) : (
                <ScrollArea className="max-h-[60vh] pr-2">
                  <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {libraryImages.map((image) => {
                      const isSelected = selectedLibraryIds.has(image.id);
                      return (
                        <button
                          key={image.id}
                          type="button"
                          onClick={() => toggleLibrarySelection(image.id)}
                          className={cn(
                            "relative aspect-square overflow-hidden rounded-md border",
                            isSelected
                              ? "border-primary ring-2 ring-primary"
                              : "border-transparent hover:border-primary"
                          )}
                        >
                          <Image
                            src={image.url}
                            alt={image.alt_text ?? "Ảnh trong thư viện"}
                            fill
                            className="object-cover"
                          />
                          <div
                            className={cn(
                              "absolute inset-0 bg-primary/20 opacity-0 transition-opacity",
                              isSelected && "opacity-100"
                            )}
                          />
                          {isSelected && (
                            <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              <Check className="h-4 w-4" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleLibraryOpenChange(false)}
              >
                Đóng
              </Button>
              <Button
                type="button"
                onClick={handleConfirmLibrarySelection}
                disabled={onLibrarySelectionChange === undefined}
              >
                Sử dụng ảnh đã chọn
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Separator />

      <input
        type="file"
        ref={fileInputRef}
        onChange={(event) => handleFileSelection(event.target.files)}
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
          "mt-1 flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-border p-6 transition-colors hover:bg-muted/50",
          isDragging && "border-primary bg-muted/50"
        )}
      >
        <div className="text-center text-muted-foreground">
          <UploadCloud className="mx-auto mb-2 text-3xl" />
          <p>Nhấp hoặc kéo thả ảnh mới vào đây để tải lên</p>
        </div>
      </div>

      {value.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-4">
          {value.map((image, index) => {
            const imageUrl =
              image instanceof File ? URL.createObjectURL(image) : image.url;
            const altText =
              image instanceof File
                ? image.name
                : image.alt_text ?? "Xem trước";
            const key =
              image instanceof File
                ? `file-${index}-${image.name}`
                : image.id;

            return (
              <div key={key} className="group relative aspect-square">
                <Image
                  src={imageUrl}
                  alt={altText}
                  fill
                  className="rounded-md object-cover"
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
                    className="h-6 w-6 opacity-70 transition-opacity group-hover:opacity-100"
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
