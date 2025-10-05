// src/app/(public)/services/page.tsx
"use client"; // highlight-line

import { Input } from "@/components/ui/input";
import ServiceCard from "@/features/service/components/ServiceCard";
import { useServices } from "@/features/service/hooks/useServices"; // highlight-line
import { useMemo, useState } from "react"; // highlight-line
import { FullPageLoader } from "@/components/ui/spinner"; // highlight-line

export default function ServicesPage() {
  // highlight-start
  // Bước 1: Gọi hook để fetch dữ liệu
  const { data: services = [], isLoading } = useServices();
  const [searchTerm, setSearchTerm] = useState("");

  // Bước 2: Lọc danh sách dịch vụ dựa trên searchTerm
  const filteredServices = useMemo(() => {
    if (!searchTerm) {
      return services;
    }
    return services.filter((service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [services, searchTerm]);

  if (isLoading) {
    return <FullPageLoader text="Đang tải danh sách dịch vụ..." />;
  }
  // highlight-end

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight">
          Khám Phá Dịch Vụ Của Chúng Tôi
        </h1>
        <p className="text-muted-foreground mt-2">
          Tìm kiếm liệu trình hoàn hảo dành cho bạn
        </p>
      </header>

      <div className="mb-8 max-w-md mx-auto">
        <Input
          type="search"
          placeholder="Tìm kiếm dịch vụ (ví dụ: massage, chăm sóc da...)"
          className="w-full"
          // highlight-start
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          // highlight-end
        />
      </div>

      {/* highlight-start */}
      {filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground">
            Không tìm thấy dịch vụ nào phù hợp với từ khóa &quot;{searchTerm}
            &quot;.
          </p>
        </div>
      )}
      {/* highlight-end */}
    </div>
  );
}
