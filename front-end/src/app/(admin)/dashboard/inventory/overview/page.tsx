// src/app/(admin)/dashboard/inventory/overview/page.tsx
"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/features/dashboard/components/StatCard";
import { DollarSign, AlertTriangle, Truck } from "lucide-react";
import LowStockProductsTable from "@/features/inventory/components/overview/LowStockProductsTable";
import RecentInventoryTransactions from "@/features/inventory/components/overview/RecentInventoryTransactions";
import InventoryValueByCategoryChart from "@/features/inventory/components/overview/InventoryValueByCategoryChart";
import { useInventoryStats } from "@/features/inventory/hooks/useInventoryStats"; // ++ IMPORT HOOK MỚI ++
import { FullPageLoader } from "@/components/ui/spinner"; // ++ IMPORT LOADER ++

export default function InventoryOverviewPage() {
  // ++ THAY THẾ DỮ LIỆU GIẢ BẰNG HOOK ++
  const { data: stats, isLoading } = useInventoryStats();

  if (isLoading) {
    return <FullPageLoader text="Đang tải dữ liệu tổng quan kho..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tổng quan Kho"
        description="Theo dõi các chỉ số quan trọng và hoạt động kho hàng gần đây."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Tổng giá trị kho"
          value={`${new Intl.NumberFormat("vi-VN").format(
            stats?.totalValue || 0
          )} ₫`}
          description="Dựa trên giá nhập của sản phẩm"
          icon={DollarSign}
        />
        <StatCard
          title="Sản phẩm sắp hết"
          value={stats?.lowStockCount?.toString() || "0"}
          description="Sản phẩm dưới ngưỡng tồn kho tối thiểu"
          icon={AlertTriangle}
          iconColor="text-warning"
        />
        <StatCard
          title="Tổng số Nhà cung cấp"
          value={stats?.supplierCount?.toString() || "0"}
          description="Đối tác cung cấp sản phẩm"
          icon={Truck}
          iconColor="text-info"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* LowStockProductsTable sẽ cần được refactor để tự fetch data */}
          <LowStockProductsTable />
        </div>
        <div className="lg:col-span-1">
          <InventoryValueByCategoryChart />
        </div>
      </div>
      <div>
        {/* RecentInventoryTransactions sẽ cần được refactor để tự fetch data */}
        <RecentInventoryTransactions />
      </div>
    </div>
  );
}
