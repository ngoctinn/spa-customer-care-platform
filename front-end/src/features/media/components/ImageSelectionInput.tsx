// src/features/media/components/ImageSelectionInput.tsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ImageIcon, Trash2, Crown, Edit } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useMediaLibrary } from "@/features/media/stores/use-media-library-store";
import { MediaImage as ImageUrl } from "@/features/media/types";
import { Card, CardContent } from "@/components/ui/card";

// --- Sub-component cho ảnh có thể sắp xếp (chế độ nhiều ảnh) ---
interface SortableImageProps {
  image: ImageUrl;
  isPrimary: boolean;
  onRemove: (id: string) => void;
}

const SortableImage = ({ image, isPrimary, onRemove }: SortableImageProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 250ms ease-in-out",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative group aspect-square transition-all
        ${isDragging ? "z-10 shadow-2xl scale-105" : "shadow-md"}
      `}
    >
      {isPrimary && (
        <div
          className="absolute top-1 left-1 z-10 bg-warning text-warning-foreground p-1 rounded-full"
          title="Ảnh chính"
        >
          <Crown className="h-4 w-4" />
        </div>
      )}
      <Image
        src={image.url}
        alt={image.alt_text || "Selected image"}
        fill
        className="object-cover rounded-md border"
      />
      <div className="absolute inset-0 bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="h-8 w-8"
          onClick={() => onRemove(image.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button
          {...attributes}
          {...listeners}
          type="button"
          variant="secondary"
          size="icon"
          className="h-8 w-8 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// --- Props cho component chính ---
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
  const { onOpen } = useMediaLibrary();
  const sensors = useSensors(useSensor(PointerSensor));

  const handleMediaSelect = (images: ImageUrl[]) => {
    // Lọc ra những ảnh mới chưa có trong danh sách hiện tại
    const newImages = images.filter(
      (newImg) => !value.some((existingImg) => existingImg.id === newImg.id)
    );

    // Kết hợp ảnh cũ và ảnh mới
    const combined = [...value, ...newImages];
    // Cắt bớt nếu vượt quá giới hạn maxImages
    const finalImages = combined.slice(0, maxImages);
    onChange(finalImages);
  };

  const handleRemove = (id: string) => {
    onChange(value.filter((img) => img.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = value.findIndex((img) => img.id === active.id);
      const newIndex = value.findIndex((img) => img.id === over.id);
      onChange(arrayMove(value, oldIndex, newIndex));
    }
  };

  const openMediaModal = () => {
    // Gọi onOpen từ store và truyền vào cấu hình
    onOpen({
      onSelect: handleMediaSelect,
      // Tính toán số lượng ảnh còn lại có thể chọn
      maxImages: maxImages - value.length,
    });
  };

  // Chế độ chọn 1 ảnh (giao diện của FeaturedImageUploader cũ)
  if (maxImages === 1) {
    const selectedImage = value?.[0] || null;

    return (
      <Card>
        <CardContent className="p-4">
          {selectedImage ? (
            <div className="relative group">
              <Image
                src={selectedImage.url}
                alt={selectedImage.alt_text || "Featured Image"}
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
                  onClick={() => onChange([])}
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

  // Chế độ chọn nhiều ảnh (giao diện cũ của ImageSelectionInput)
  return (
    <div>
      <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={value} strategy={rectSortingStrategy}>
            <AnimatePresence>
              {value.map((image, index) => (
                <motion.div
                  key={image.id}
                  layout // Quan trọng: tự động tạo hoạt ảnh khi vị trí thay đổi
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <SortableImage
                    image={image}
                    isPrimary={index === 0}
                    onRemove={handleRemove}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </SortableContext>
        </DndContext>

        {value.length < maxImages && (
          <div
            onClick={openMediaModal}
            className="
      flex flex-col items-center justify-center p-2 
      border-2 border-dashed border-border rounded-md 
      cursor-pointer transition-all duration-300
      hover:border-primary hover:bg-primary/5 hover:text-primary
      group
    "
          >
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
            <p className="mt-2 text-xs text-center text-muted-foreground">
              Thêm ảnh
            </p>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Ảnh đầu tiên là ảnh chính. Kéo để sắp xếp lại.
      </p>
    </div>
  );
}
