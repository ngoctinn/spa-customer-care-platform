import { getPromotions } from "@/features/promotion/api/promotion.api";
import PromotionCard from "@/features/promotion/components/PromotionCard";
import { Input } from "@/components/ui/input";

export default async function PromotionsPage() {
  const promotions = await getPromotions();

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
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {promotions.map((promotion) => (
          <PromotionCard key={promotion.id} promotion={promotion} />
        ))}
      </div>
    </div>
  );
}
