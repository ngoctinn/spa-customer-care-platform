// src/app/(public)/promotions/page.tsx
"use client";

import { Input } from "@/components/ui/input";
import PromotionCard from "@/features/promotion/components/PromotionCard";
import { usePromotions } from "@/features/promotion/hooks/usePromotions"; // Giả sử bạn đã tạo hook này
import { useMemo, useState } from "react";
import { FullPageLoader } from "@/components/ui/spinner";

export default function PromotionsPage() {
  const { data: promotions = [], isLoading } = usePromotions();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPromotions = useMemo(() => {
    if (!searchTerm) return promotions;
    return promotions.filter((promo) =>
      promo.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [promotions, searchTerm]);

  if (isLoading) {
    return <FullPageLoader text="Đang tải danh sách khuyến mãi..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight">
          Ưu Đãi & Khuyến Mãi Hấp Dẫn
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Đừng bỏ lỡ các chương trình ưu đãi đặc biệt của chúng tôi để nâng tầm
          trải nghiệm chăm sóc của bạn.
        </p>
      </header>

      <div className="mb-8 max-w-md mx-auto">
        <Input
          type="search"
          placeholder="Tìm kiếm khuyến mãi..."
          className="w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredPromotions.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPromotions.map((promotion) => (
            <PromotionCard key={promotion.id} promotion={promotion} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground">
            Không tìm thấy khuyến mãi nào phù hợp với từ khóa &quot;{searchTerm}
            &quot;.
          </p>
        </div>
      )}
    </div>
  );
}
