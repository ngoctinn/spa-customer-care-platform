// src/app/(public)/promotions/page.tsx
"use client";

import PromotionCard from "@/features/promotion/components/PromotionCard";
import { usePromotions } from "@/features/promotion/hooks/usePromotions";
import { Promotion } from "@/features/promotion/types";
import { ListPageLayout } from "@/components/layout/public/ListPageLayout";

export default function PromotionsPage() {
  return (
    <ListPageLayout<Promotion>
      title="Ưu Đãi & Khuyến Mãi Hấp Dẫn"
      description="Đừng bỏ lỡ các chương trình ưu đãi đặc biệt của chúng tôi để nâng tầm trải nghiệm chăm sóc của bạn."
      searchPlaceholder="Tìm kiếm khuyến mãi..."
      useDataHook={usePromotions}
      filterFn={(promotion, searchTerm) =>
        promotion.title.toLowerCase().includes(searchTerm)
      }
      renderItem={(promotion) => <PromotionCard promotion={promotion} />}
      gridClassName="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
      skeletonCount={6}
    />
  );
}
