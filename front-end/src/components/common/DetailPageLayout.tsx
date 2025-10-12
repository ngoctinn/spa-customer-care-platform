"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { ImageLightbox } from "./ImageLightbox";
import type { Slide } from "yet-another-react-lightbox";

interface DetailPageLayoutProps {
  mainImage: string | null;
  imageAlt: string;
  images: { url: string; alt?: string }[];
  onThumbnailClick: (url: string) => void;
  title: React.ReactNode;
  description: React.ReactNode;
  details: React.ReactNode;
  purchaseActions: React.ReactNode;
  children: React.ReactNode;
}

export const DetailPageLayout = ({
  mainImage: initialMainImage,
  imageAlt,
  images,
  onThumbnailClick,
  title,
  description,
  details,
  purchaseActions,
  children,
}: DetailPageLayoutProps) => {
  // State để quản lý ảnh đang hiển thị
  const [mainImage] = useState<string | null>(initialMainImage);
  // State cho Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const thumbnailUrls = images.map((img) => img.url);

  // Chuẩn bị slides cho lightbox
  const slides: Slide[] = images.map((img) => ({
    src: img.url,
    alt: img.alt || imageAlt,
  }));

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Tìm index của ảnh chính hiện tại để mở lightbox đúng vị trí
  const currentMainImageIndex = images.findIndex(
    (img) => img.url === mainImage
  );

  return (
    <div className="container mx-auto py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Cột thư viện ảnh */}
        <div>
          <div
            className="relative aspect-square w-full mb-4 overflow-hidden rounded-lg shadow-lg border bg-muted cursor-pointer"
            onClick={() =>
              openLightbox(
                currentMainImageIndex >= 0 ? currentMainImageIndex : 0
              )
            }
          >
            <Image
              src={mainImage || "/images/product-placeholder.png"}
              alt={imageAlt}
              fill
              className="object-contain p-4 transition-all duration-300"
            />
          </div>
          <div className="flex gap-2">
            {thumbnailUrls.map((url, index) => (
              <div
                key={index}
                className={cn(
                  "relative w-20 h-20 rounded-md cursor-pointer overflow-hidden ring-2 ring-transparent transition-all hover:ring-primary/50 bg-muted",
                  mainImage === url && "ring-primary"
                )}
                onClick={() => onThumbnailClick(url)}
              >
                <Image
                  src={url}
                  alt={`${imageAlt} thumbnail ${index + 1}`}
                  fill
                  className="object-contain p-1"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Cột thông tin chi tiết */}
        <div className="space-y-6">
          {title}
          {description}
          <div className="flex items-center gap-6 my-6">{details}</div>
          {purchaseActions}
        </div>
      </div>
      <div className="mt-12">{children}</div>

      <ImageLightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={slides}
        index={lightboxIndex}
      />
    </div>
  );
};
