// src/app/(public)/promotions/page.tsx
"use client";

import { DisplayCardSkeleton } from "@/components/common/DisplayCardSkeleton";
import { DataStateMessage } from "@/components/common/DataStateMessage";
import { Input } from "@/components/ui/input";
import PromotionCard from "@/features/promotion/components/PromotionCard";
import { usePromotions } from "@/features/promotion/hooks/usePromotions";
import { useMemo, useState } from "react";

export default function PromotionsPage() {
  const {
    data: promotions = [],
    isLoading,
    isError,
    error,
  } = usePromotions();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPromotions = useMemo(() => {
    if (!searchTerm) return promotions;
    return promotions.filter((promo) =>
      promo.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [promotions, searchTerm]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <DisplayCardSkeleton key={index} />
          ))}
        </div>
      );
    }

    if (isError) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể tải danh sách khuyến mãi.";
      return (
        <DataStateMessage
          variant="error"
          message="Không thể tải danh sách khuyến mãi"
          description={message}
          className="mx-auto max-w-xl"
        />
      );
    }

    if (promotions.length === 0) {
      return (
        <DataStateMessage
          message="Hiện chưa có chương trình khuyến mãi nào."
          description="Vui lòng quay lại sau để cập nhật những ưu đãi mới nhất."
          className="mx-auto max-w-xl"
        />
      );
    }

    if (filteredPromotions.length === 0) {
      return (
        <DataStateMessage
          message="Không tìm thấy khuyến mãi phù hợp"
          description={`Không có ưu đãi nào khớp với từ khóa "${searchTerm}".`}
          className="mx-auto max-w-xl"
        />
      );
    }

    return (
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPromotions.map((promotion) => (
          <PromotionCard key={promotion.id} promotion={promotion} />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Ưu Đãi & Khuyến Mãi Hấp Dẫn
        </h1>
        <p className="text-muted-foreground mt-2 mx-auto max-w-2xl">
          Đừng bỏ lỡ các chương trình ưu đãi đặc biệt của chúng tôi để nâng tầm
          trải nghiệm chăm sóc của bạn.
        </p>
      </header>

      <div className="mx-auto mb-8 max-w-md">
        <Input
          type="search"
          placeholder="Tìm kiếm khuyến mãi..."
          className="w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {renderContent()}
    </div>
  );
}
