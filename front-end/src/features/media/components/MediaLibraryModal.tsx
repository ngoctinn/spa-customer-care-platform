"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { UploadCloud, AlertCircle } from "lucide-react";
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

interface MediaLibraryModalProps {
  onSelectImage: (image: MediaImage) => void;
}

export function MediaLibraryModal({ onSelectImage }: MediaLibraryModalProps) {
  const { isOpen, onClose } = useMediaLibrary();
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  // 1. Lấy dữ liệu media từ API bằng useQuery
  const { data: media = [], isLoading, isError } = useMediaImages();

  // 2. Lấy mutation hook để upload ảnh
  const uploadMutation = useUploadImage();

  const handleSelect = () => {
    const selectedImage = media.find((img) => img.id === selectedImageId);
    if (selectedImage) {
      onSelectImage(selectedImage);
      onClose();
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles: UploadingFile[] = acceptedFiles.map((file) => ({
        id: uuidv4(),
        file,
        progress: 0,
        status: "uploading",
      }));

      // Thêm file vào danh sách đang upload để hiển thị trên UI
      setUploadingFiles((prev) => [...prev, ...newFiles]);

      // 3. Gọi mutation cho mỗi file
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
        <Tabs defaultValue="library" className="flex-grow flex flex-col">
          <TabsList>
            <TabsTrigger value="library">Thư viện</TabsTrigger>
            <TabsTrigger value="upload">Tải lên tệp mới</TabsTrigger>
          </TabsList>

          {/* Tab Thư viện */}
          <TabsContent value="library" className="flex-grow mt-4">
            <ScrollArea className="h-[calc(100%-60px)] pr-4">
              {isLoading && (
                <div className="flex justify-center items-center h-full">
                  <Spinner />
                </div>
              )}
              {isError && (
                <p className="text-destructive text-center">
                  Không thể tải thư viện media.
                </p>
              )}
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {media.map((image) => (
                  <Card
                    key={image.id}
                    onClick={() => setSelectedImageId(image.id)}
                    className={`cursor-pointer transition-all ${
                      selectedImageId === image.id ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <CardContent className="p-0">
                      <Image
                        src={image.url}
                        alt={image.alt_text || "media image"}
                        width={150}
                        height={150}
                        className="aspect-square object-cover w-full h-full rounded-md"
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Tab Tải lên */}
          <TabsContent value="upload" className="flex-grow mt-4">
            <div className="flex flex-col h-full">
              <div
                {...getRootProps()}
                className={`flex-shrink-0 border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-primary bg-primary/10"
                    : "border-border"
                }`}
              >
                <input {...getInputProps()} />
                <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  {isDragActive
                    ? "Thả tệp vào đây..."
                    : "Kéo thả tệp vào đây, hoặc nhấp để chọn tệp"}
                </p>
              </div>
              <ScrollArea className="mt-4 flex-grow">
                <div className="space-y-4 pr-4">
                  {uploadingFiles.map((f) => (
                    <div key={f.id} className="flex items-center gap-4">
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
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSelect} disabled={!selectedImageId}>
            Chọn ảnh
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
