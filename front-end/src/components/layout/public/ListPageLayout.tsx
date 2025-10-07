// src/components/layout/public/ListPageLayout.tsx
"use client";

import { useMemo, useState, ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { DisplayCardSkeleton } from "@/components/common/DisplayCardSkeleton";
import { DataStateMessage } from "@/components/common/DataStateMessage";

interface ListPageLayoutProps<T> {
  title: string;
  description: string;
  searchPlaceholder: string;
  useDataHook: () => {
    data: T[] | undefined;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
  };
  renderItem: (item: T) => ReactNode;
  filterFn: (item: T, searchTerm: string) => boolean;
  gridClassName?: string;
  skeletonCount?: number;
}

export function ListPageLayout<T extends { id: string | number }>({
  title,
  description,
  searchPlaceholder,
  useDataHook,
  renderItem,
  filterFn,
  gridClassName = "grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4",
  skeletonCount = 8,
}: ListPageLayoutProps<T>) {
  const { data = [], isLoading, isError, error } = useDataHook();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter((item) => filterFn(item, searchTerm.toLowerCase()));
  }, [data, searchTerm, filterFn]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className={gridClassName}>
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <DisplayCardSkeleton key={index} />
          ))}
        </div>
      );
    }

    if (isError) {
      const message =
        error instanceof Error ? error.message : "Đã có lỗi xảy ra.";
      return (
        <DataStateMessage
          variant="error"
          message={`Không thể tải danh sách`}
          description={message}
          className="mx-auto max-w-xl"
        />
      );
    }

    if (data.length === 0) {
      return (
        <DataStateMessage
          message="Hiện chưa có dữ liệu."
          className="mx-auto max-w-xl"
        />
      );
    }

    if (filteredItems.length === 0) {
      return (
        <DataStateMessage
          message="Không tìm thấy kết quả phù hợp"
          description={`Không có mục nào khớp với từ khóa "${searchTerm}".`}
          className="mx-auto max-w-xl"
        />
      );
    }

    return (
      <div className={gridClassName}>
        {filteredItems.map((item) => (
          <div key={item.id}>{renderItem(item)}</div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          {description}
        </p>
      </header>

      <div className="mb-8 max-w-md mx-auto">
        <Input
          type="search"
          placeholder={searchPlaceholder}
          className="w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {renderContent()}
    </div>
  );
}
