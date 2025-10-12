import { getProducts } from "@/features/product/api/product.api";
import { getServices } from "@/features/service/api/service.api";
import { getTreatmentPlans } from "@/features/treatment/apis/treatment.api";
import { Suspense } from "react";
import { SearchResultList } from "@/features/search/components/SearchResultList";
import { DataStateMessage } from "@/components/common/DataStateMessage";
import { Loader2 } from "lucide-react";
import { Metadata } from "next";

// Định nghĩa Metadata động cho SEO
type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const query = typeof searchParams.q === "string" ? searchParams.q : "";
  return {
    title: query ? `Kết quả cho "${query}"` : "Tìm kiếm",
  };
}

// --- Component chính của trang tìm kiếm ---
export default async function SearchPage({ searchParams }: Props) {
  const query = typeof searchParams.q === "string" ? searchParams.q : undefined;

  if (!query) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold">Tìm kiếm</h1>
        <p className="text-muted-foreground mt-2">
          Vui lòng nhập từ khóa vào ô tìm kiếm để bắt đầu.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Kết quả tìm kiếm cho:{" "}
          <span className="text-primary">&quot;{query}&quot;</span>
        </h1>
      </header>

      <Suspense fallback={<SearchResultsSkeleton />}>
        <SearchResults query={query} />
      </Suspense>
    </div>
  );
}

// --- Component con để fetch và hiển thị dữ liệu ---
async function SearchResults({ query }: { query: string }) {
  // Gọi API song song để lấy kết quả
  const [services, products, treatmentPlans] = await Promise.all([
    getServices({ search: query }),
    getProducts({ search: query }),
    getTreatmentPlans({ search: query }),
  ]);

  const hasResults =
    services.length > 0 || products.length > 0 || treatmentPlans.length > 0;

  if (!hasResults) {
    return (
      <DataStateMessage
        message="Không tìm thấy kết quả"
        description={`Chúng tôi không tìm thấy kết quả nào phù hợp với từ khóa "${query}".`}
        className="mx-auto max-w-xl"
      />
    );
  }

  return (
    <div className="space-y-12">
      {services.length > 0 && (
        <SearchResultList title="Dịch vụ" items={services} itemType="service" />
      )}
      {products.length > 0 && (
        <SearchResultList
          title="Sản phẩm"
          items={products}
          itemType="product"
        />
      )}
      {treatmentPlans.length > 0 && (
        <SearchResultList
          title="Liệu trình"
          items={treatmentPlans}
          itemType="treatment"
        />
      )}
    </div>
  );
}

// --- Component Skeleton cho trạng thái loading ---
function SearchResultsSkeleton() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="ml-4 text-muted-foreground">Đang tìm kiếm...</p>
    </div>
  );
}
