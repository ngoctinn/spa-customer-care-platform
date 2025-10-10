// src/features/media/components/MediaLibraryModal.tsx
"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { UploadCloud, AlertCircle, Check } from "lucide-react";
import Image from "next/image";
import { useMediaLibrary } from "@/features/media/stores/use-media-library-store";
import type { MediaImage, UploadingFile } from "@/features/media/types";
import { v4 as uuidv4 } from "uuid";
import {
  useMediaImages,
  useUploadImage,
} from "@/features/media/hooks/useMedia";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

export function MediaLibraryModal() {
  const { isOpen, onClose, onSelect, maxImages } = useMediaLibrary();
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  const { data: media = [], isLoading, isError } = useMediaImages();
  const uploadMutation = useUploadImage();

  const handleImageClick = (imageId: string) => {
    setSelectedImageIds((prevSelected) => {
      // Nếu ảnh đã được chọn -> bỏ chọn
      if (prevSelected.includes(imageId)) {
        return prevSelected.filter((id) => id !== imageId);
      }

      // Nếu là chế độ chọn 1 ảnh -> thay thế
      if (maxImages === 1) {
        return [imageId];
      }

      // Nếu chưa đạt giới hạn -> thêm vào danh sách
      if (prevSelected.length < maxImages) {
        return [...prevSelected, imageId];
      }

      // Nếu đã đạt giới hạn -> không làm gì
      return prevSelected;
    });
  };

  // Hàm xử lý khi nhấn nút "Chọn ảnh"
  const handleSelect = () => {
    const selectedImages = media.filter((img) =>
      selectedImageIds.includes(img.id)
    );
    if (selectedImages.length > 0) {
      onSelect(selectedImages); // Gọi callback từ store với mảng ảnh đã chọn
      onClose();
      setSelectedImageIds([]); // Reset lại lựa chọn sau khi đóng
    }
  };

  const onDialogClose = () => {
    onClose();
    setSelectedImageIds([]); // Reset lựa chọn khi đóng dialog
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles: UploadingFile[] = acceptedFiles.map((file) => ({
        id: uuidv4(),
        file,
        progress: 0,
        status: "uploading",
      }));

      setUploadingFiles((prev) => [...prev, ...newFiles]);

      newFiles.forEach((uploadingFile) => {
        uploadMutation.mutate(uploadingFile.file, {
          onSuccess: () => {
            setUploadingFiles((prev) =>
              prev.filter((f) => f.id !== uploadingFile.id)
            );
          },
          onError: (error) => {
            toast.error(`Tải lên "${uploadingFile.file.name}" thất bại.`, {
              description: error.message,
            });
            setUploadingFiles((prev) =>
              prev.map((f) =>
                f.id === uploadingFile.id ? { ...f, status: "error" } : f
              )
            );
          },
        });
      });
    },
    [uploadMutation]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".png", ".gif", ".jpg"] },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Thư viện Media</DialogTitle>
        </DialogHeader>

        {/* --- Giao diện hợp nhất --- */}
        <div className="flex-grow flex flex-col gap-4 overflow-hidden">
          {/* Vùng Tải Lên */}
          <div
            {...getRootProps()}
            className={`
    flex-shrink-0 border-2 border-dashed rounded-lg p-6 text-center 
    cursor-pointer transition-all duration-300 ease-in-out
    group
    ${
      isDragActive
        ? "border-primary bg-primary/10 border-solid scale-105"
        : "border-border hover:border-primary/50 hover:bg-muted/50"
    }`}
          >
            <input {...getInputProps()} />
            <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground transition-transform duration-300 group-hover:scale-110" />
            <p className="mt-2 text-sm text-muted-foreground">
              {isDragActive
                ? "Thả tệp vào đây..."
                : "Kéo thả hoặc nhấp để chọn tệp"}
            </p>
          </div>

          {/* Danh sách đang tải & Lưới Thư viện */}
          <ScrollArea className="flex-grow pr-4 -mr-4">
            <div className="space-y-4">
              {/* Danh sách đang tải */}
              {uploadingFiles.length > 0 && (
                <div className="space-y-4">
                  {uploadingFiles.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center gap-4 p-2 rounded-md border bg-muted/50"
                    >
                      <Image
                        src={URL.createObjectURL(f.file)}
                        alt={f.file.name}
                        width={48}
                        height={48}
                        className="rounded-md object-cover w-12 h-12"
                      />
                      <div className="flex-grow">
                        <p className="text-sm font-medium truncate">
                          {f.file.name}
                        </p>
                        {f.status === "uploading" && (
                          <Progress
                            value={uploadMutation.isPending ? f.progress : 100}
                            className="h-2 mt-1"
                          />
                        )}
                        {f.status === "error" && (
                          <p className="text-xs text-destructive">
                            Có lỗi xảy ra.
                          </p>
                        )}
                      </div>
                      {f.status === "uploading" && uploadMutation.isPending && (
                        <Spinner className="h-5 w-5" />
                      )}
                      {f.status === "error" && (
                        <AlertCircle className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Lưới Thư viện */}
              {isLoading && (
                <div className="flex justify-center items-center h-40">
                  <Spinner />
                </div>
              )}
              {isError && (
                <p className="text-destructive text-center py-8">
                  Không thể tải thư viện media.
                </p>
              )}
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {media.map((image) => {
                  const isSelected = selectedImageIds.includes(image.id);
                  return (
                    <Card
                      key={image.id}
                      onClick={() => handleImageClick(image.id)}
                      className={`
          cursor-pointer transition-all group relative overflow-hidden rounded-lg
          ${
            isSelected
              ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
              : "ring-0"
          }
        `}
                    >
                      <CardContent className="p-0">
                        <Image
                          src={image.url}
                          alt={image.alt_text || "media image"}
                          width={150}
                          height={150}
                          className="aspect-square object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                        />
                        {/* Lớp phủ khi hover */}
                        <div className="absolute inset-0 bg-background/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </CardContent>

                      {/* Checkbox giả để hiển thị trạng thái chọn */}
                      <div
                        className={`
            absolute top-2 right-2 w-5 h-5 rounded-full border-2 border-foreground
            flex items-center justify-center transition-all
            ${isSelected ? "bg-primary border-primary" : "bg-background/40"}
          `}
                      >
                        {isSelected && (
                          <Check className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={handleSelect}
            disabled={selectedImageIds.length === 0}
          >
            {/* Cập nhật nội dung nút để hiển thị số lượng */}
            Chọn{" "}
            {selectedImageIds.length > 0
              ? `(${selectedImageIds.length})`
              : ""}{" "}
            ảnh
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
