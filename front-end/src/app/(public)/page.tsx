// src/app/(public)/page.tsx
import { Button } from "@/components/ui/button";
import { getServices } from "@/features/service/api/service.api";
import ServiceCard from "@/features/service/components/ServiceCard";
import { getProducts } from "@/features/product/api/product.api";
import ProductCard from "@/features/product/components/ProductCard";
import { getTreatmentPlans } from "@/features/treatment/api/treatment.api";
import TreatmentPlanCard from "@/features/treatment/components/TreatmentPlanCard";
import { FeaturedSection } from "@/components/common/FeaturedSection";
import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import type { Metadata } from "next";

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
      {/* Background Image */}
      <div className="absolute inset-0 bg-muted-foreground z-10" />
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        poster="/images/hero-poster.jpg" // Ảnh hiển thị khi video chưa tải
      >
        <source src="/videos/spa-hero-video.mp4" type="video/mp4" />
        {/* Thêm các định dạng video khác ở đây nếu cần */}
      </video>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight drop-shadow-md">
          Tìm Lại Sự An Yên & Vẻ Đẹp Rạng Rỡ
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-gray-200 drop-shadow-sm">
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

// --- MAIN HOMEPAGE COMPONENT ---
export default async function HomePage() {
  // Lấy dữ liệu đồng thời để tối ưu tốc độ tải trang
  // const [services, treatmentPlans, products] = await Promise.all([
  //   getServices(),
  //   getTreatmentPlans(),
  //   getProducts(),
  // ]);
  const services = await getServices();

  // Lấy 3 mục đầu tiên để hiển thị
  const featuredServices = services.slice(0, 3);
  // const featuredTreatmentPlans = treatmentPlans.slice(0, 3);
  // const featuredProducts = products.slice(0, 3);

  return (
    <div>
      <HeroSection />

      {/* Featured Services */}
      <FeaturedSection
        title="Dịch Vụ Nổi Bật"
        description="Khám phá các dịch vụ được yêu thích nhất, mang lại hiệu quả tức thì và cảm giác thư thái."
        viewAllLink="/services"
      >
        {featuredServices.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </FeaturedSection>

      {/* Divider */}
      <div className="border-b" />

      {/* Featured Treatment Plans */}
      {/* <FeaturedSection
        title="Liệu Trình Chuyên Sâu"
        description="Đầu tư cho vẻ đẹp dài lâu với các gói liệu trình được thiết kế khoa học và chuyên biệt."
        viewAllLink="/treatment-plans"
      >
        {featuredTreatmentPlans.map((plan) => (
          <TreatmentPlanCard key={plan.id} plan={plan} />
        ))}
      </FeaturedSection> */}

      {/* Divider */}
      {/* <div className="border-b" /> */}

      {/* Featured Products */}
      {/* <FeaturedSection
        title="Sản Phẩm Cao Cấp"
        description="Mang trải nghiệm spa về nhà với các sản phẩm được chuyên gia của chúng tôi tin dùng."
        viewAllLink="/products"
      >
        {featuredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </FeaturedSection> */}
    </div>
  );
}
