// src/app/(public)/page.tsx
import { Button } from "@/components/ui/button";
import { DataStateMessage } from "@/components/common/DataStateMessage";
import { FeaturedSection } from "@/components/common/FeaturedSection";
import ProductCard from "@/features/product/components/ProductCard";
import { getProducts } from "@/features/product/api/product.api";
import PromotionCard from "@/features/promotion/components/PromotionCard";
import { getPromotions } from "@/features/promotion/api/promotion.api";
import { getServices } from "@/features/service/api/service.api";
import ServiceCard from "@/features/service/components/ServiceCard";
import { getTreatmentPlans } from "@/features/treatment/api/treatment.api";
import TreatmentPlanCard from "@/features/treatment/components/TreatmentPlanCard";
import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import type { Metadata } from "next";
import { AnimatedSection } from "@/components/common/AnimatedSection";

// Tối ưu SEO cho trang chủ
export const metadata: Metadata = {
  title: "Serenity Spa - Nơi Vẻ Đẹp và Sự Thư Giãn Hội Tụ",
  description:
    "Chào mừng đến với Serenity Spa. Khám phá các dịch vụ chăm sóc da, massage trị liệu, gói liệu trình cao cấp và các sản phẩm chuyên nghiệp. Đặt lịch ngay hôm nay!",
};

// --- HERO SECTION COMPONENT ---
function HeroSection() {
  return (
    <section className="relative h-[60vh] min-h-[400px] w-full flex items-center justify-center text-center text-white">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        poster="/images/hero-poster.jpg" // Ảnh hiển thị khi video chưa tải
      >
        <source src="/videos/spa-hero-video.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-[var(--section-video)]" />

      <div className="relative z-20 container mx-auto px-4">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight drop-shadow-md">
          Tìm Lại Sự An Yên & Vẻ Đẹp Rạng Rỡ
        </h1>

        <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-shadow-muted-foreground drop-shadow-sm">
          Trải nghiệm các liệu pháp chăm sóc hàng đầu trong một không gian thư
          giãn tuyệt đối.
        </p>
        <div className="mt-8">
          <Button size="lg" asChild>
            <Link href="/booking">
              <CalendarPlus className="mr-2 h-5 w-5" />
              Đặt Lịch Ngay
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

interface SectionState<T> {
  items: T[];
  error?: string;
}

function parseSettledResult<T>(
  result: PromiseSettledResult<T[]>
): SectionState<T> {
  if (result.status === "fulfilled") {
    return { items: result.value ?? [] };
  }

  const reason = result.reason;
  const errorMessage =
    reason instanceof Error
      ? reason.message
      : "Không thể tải dữ liệu. Vui lòng thử lại.";

  return { items: [], error: errorMessage };
}

// --- MAIN HOMEPAGE COMPONENT ---
export default async function HomePage() {
  const [
    servicesResult,
    treatmentPlansResult,
    productsResult,
    promotionsResult,
  ] = await Promise.allSettled([
    getServices({ limit: 3 }),
    getTreatmentPlans({ limit: 3 }),
    getProducts({ limit: 4 }),
    getPromotions(),
  ]);

  const servicesState = parseSettledResult(servicesResult);
  const treatmentPlansState = parseSettledResult(treatmentPlansResult);
  const productsState = parseSettledResult(productsResult);
  const promotionsState = parseSettledResult(promotionsResult);

  return (
    <div>
      <HeroSection />

      {/* Featured Services */}
      <AnimatedSection>
        <FeaturedSection
          title="Dịch Vụ Nổi Bật"
          description="Khám phá các dịch vụ được yêu thích nhất, mang lại hiệu quả tức thì và cảm giác thư thái."
          viewAllLink="/services"
        >
          {servicesState.error ? (
            <DataStateMessage
              variant="error"
              message="Không thể tải danh sách dịch vụ"
              description={servicesState.error}
              className="col-span-full"
            />
          ) : servicesState.items.length === 0 ? (
            <DataStateMessage
              message="Hiện chưa có dịch vụ nổi bật để hiển thị."
              className="col-span-full"
            />
          ) : (
            servicesState.items
              .slice(0, 3)
              .map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))
          )}
        </FeaturedSection>
      </AnimatedSection>

      {/* Divider */}
      <div className="border-b" />

      {/* Featured Treatment Plans */}
      <AnimatedSection>
        <FeaturedSection
          title="Liệu Trình Chuyên Sâu"
          description="Đầu tư cho vẻ đẹp dài lâu với các gói liệu trình được thiết kế khoa học và chuyên biệt."
          viewAllLink="/treatment-plans"
        >
          {treatmentPlansState.error ? (
            <DataStateMessage
              variant="error"
              message="Không thể tải danh sách liệu trình"
              description={treatmentPlansState.error}
              className="col-span-full"
            />
          ) : treatmentPlansState.items.length === 0 ? (
            <DataStateMessage
              message="Hiện chưa có liệu trình nào được giới thiệu."
              className="col-span-full"
            />
          ) : (
            treatmentPlansState.items
              .slice(0, 3)
              .map((plan) => <TreatmentPlanCard key={plan.id} plan={plan} />)
          )}
        </FeaturedSection>
      </AnimatedSection>

      {/* Divider */}
      <div className="border-b" />

      {/* Featured Products */}
      <AnimatedSection>
        <FeaturedSection
          title="Sản Phẩm Cao Cấp"
          description="Mang trải nghiệm spa về nhà với các sản phẩm được chuyên gia của chúng tôi tin dùng."
          viewAllLink="/products"
          viewAllText="Xem tất cả sản phẩm"
        >
          {productsState.error ? (
            <DataStateMessage
              variant="error"
              message="Không thể tải danh sách sản phẩm"
              description={productsState.error}
              className="col-span-full"
            />
          ) : productsState.items.length === 0 ? (
            <DataStateMessage
              message="Hiện chưa có sản phẩm nào được cập nhật."
              className="col-span-full"
            />
          ) : (
            productsState.items
              .slice(0, 4)
              .map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
          )}
        </FeaturedSection>
      </AnimatedSection>

      <div className="border-b" />
      <AnimatedSection>
        <FeaturedSection
          title="Ưu Đãi Đang Diễn Ra"
          description="Tiết kiệm chi phí với các chương trình khuyến mãi được cập nhật liên tục."
          viewAllLink="/promotions"
          viewAllText="Xem tất cả khuyến mãi"
        >
          {promotionsState.error ? (
            <DataStateMessage
              variant="error"
              message="Không thể tải danh sách khuyến mãi"
              description={promotionsState.error}
              className="col-span-full"
            />
          ) : promotionsState.items.length === 0 ? (
            <DataStateMessage
              message="Hiện chưa có chương trình khuyến mãi nào."
              className="col-span-full"
            />
          ) : (
            promotionsState.items
              .slice(0, 3)
              .map((promotion) => (
                <PromotionCard key={promotion.id} promotion={promotion} />
              ))
          )}
        </FeaturedSection>
      </AnimatedSection>
    </div>
  );
}
