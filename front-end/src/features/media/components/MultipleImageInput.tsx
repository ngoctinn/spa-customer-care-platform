// src/features/media/components/MultipleImageInput.tsx
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
import { GripVertical, ImageIcon, Trash2, Crown } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useMediaLibrary } from "@/features/media/stores/use-media-library-store";
import { MediaImage as ImageUrl } from "@/features/media/types";

// --- Sub-component cho ảnh có thể sắp xếp ---
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
      className={`relative group aspect-square transition-all ${
        isDragging ? "z-10 shadow-2xl scale-105" : "shadow-md"
      }`}
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
interface MultipleImageInputProps {
  value: ImageUrl[];
  onChange: (images: ImageUrl[]) => void;
  maxImages: number;
}

export function MultipleImageInput({
  value = [],
  onChange,
  maxImages,
}: MultipleImageInputProps) {
  const { onOpen } = useMediaLibrary();
  const sensors = useSensors(useSensor(PointerSensor));

  const handleMediaSelect = (images: ImageUrl[]) => {
    const newImages = images.filter(
      (newImg) => !value.some((existingImg) => existingImg.id === newImg.id)
    );
    const combined = [...value, ...newImages];
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
    onOpen({
      onSelect: handleMediaSelect,
      maxImages: maxImages - value.length,
    });
  };

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
                  layout
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
            className="flex flex-col items-center justify-center p-2 border-2 border-dashed border-border rounded-md cursor-pointer transition-all duration-300 hover:border-primary hover:bg-primary/5 hover:text-primary group"
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
