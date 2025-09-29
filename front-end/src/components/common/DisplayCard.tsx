// src/components/common/DisplayCard.tsx

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

/**
 * Props cho DisplayCard component.
 * Component này có thể tái sử dụng để hiển thị các loại card khác nhau
 * như Service, Product, Treatment Plan, etc.
 */
interface DisplayCardProps {
  // Đường dẫn khi click vào card
  href: string;
  // URL hình ảnh
  imageUrl: string;
  // Tiêu đề chính của card
  title: string;
  // Mô tả ngắn (tùy chọn)
  description?: string;
  // Nội dung tùy chỉnh cho phần footer
  footerContent: ReactNode;
  // Kiểu hiển thị hình ảnh (cover hoặc contain)
  imageFit?: "cover" | "contain";
}

export default function DisplayCard({
  href,
  imageUrl,
  title,
  description,
  footerContent,
  imageFit = "cover", // Mặc định là 'cover'
}: DisplayCardProps) {
  return (
    <Link href={href} className="group flex">
      <Card className="flex flex-col w-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <CardHeader className="p-0">
          <div className="relative w-full h-48 overflow-hidden rounded-t-lg bg-muted">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className={`transition-transform duration-300 group-hover:scale-105 ${
                imageFit === "cover" ? "object-cover" : "object-contain p-4"
              }`}
            />
          </div>
        </CardHeader>
        <CardContent className="flex-grow pt-6">
          <CardTitle className="text-xl mb-2 h-14 line-clamp-2">
            {title}
          </CardTitle>
          {description && (
            <p className="text-muted-foreground text-sm line-clamp-3 h-[60px]">
              {description}
            </p>
          )}
        </CardContent>
        <CardFooter>{footerContent}</CardFooter>
      </Card>
    </Link>
  );
}
