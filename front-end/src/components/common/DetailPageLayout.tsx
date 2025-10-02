"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import React from "react";

interface DetailPageLayoutProps {
  mainImage: string | null;
  imageAlt: string;
  thumbnailUrls: string[];
  onThumbnailClick: (url: string) => void;
  title: React.ReactNode;
  description: React.ReactNode;
  details: React.ReactNode;
  purchaseActions: React.ReactNode;
  children: React.ReactNode;
}

export const DetailPageLayout = ({
  mainImage,
  imageAlt,
  thumbnailUrls,
  onThumbnailClick,
  title,
  description,
  details,
  purchaseActions,
  children,
}: DetailPageLayoutProps) => {
  return (
    <div className="container mx-auto py-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Cột thư viện ảnh */}
        <div>
          <div className="relative aspect-square w-full mb-4 overflow-hidden rounded-lg shadow-lg border bg-white">
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
                  "relative w-20 h-20 rounded-md cursor-pointer overflow-hidden ring-2 ring-transparent transition-all hover:ring-primary/50 bg-white border",
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

        <div className="space-y-6">
          {title}
          {description}
          <div className="flex items-center gap-6 my-6">{details}</div>
          {purchaseActions}
          {/* Hiển thị TreatmentSteps nếu được cung cấp */}
        </div>
      </div>
      <div className="mt-12">{children}</div>
    </div>
  );
};
