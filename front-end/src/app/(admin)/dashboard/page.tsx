// src/app/(admin)/dashboard/page.tsx
"use client";

import { StatCard } from "@/features/dashboard/components/StatCard";
import { RevenueChart } from "@/features/dashboard/components/RevenueChart";
import { UpcomingAppointments } from "@/features/dashboard/components/UpcomingAppointments";
import { DollarSign, Users, CreditCard, Activity } from "lucide-react";
import { FullPageLoader } from "@/components/ui/spinner";
import { useDashboardStats } from "@/features/dashboard/hooks/useDashboardStats";

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading || !stats) {
    return <FullPageLoader text="Đang tải dữ liệu tổng quan..." />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Tổng quan</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title="Tổng doanh thu"
          value={`${new Intl.NumberFormat("vi-VN").format(
            stats.total_revenue
          )} ₫`}
          description={`${
            stats.revenue_change_percentage >= 0 ? "+" : ""
          }${stats.revenue_change_percentage}% so với tháng trước`}
          icon={DollarSign}
        />
        <StatCard
          title="Tổng khách hàng"
          value={`+${stats.total_customers}`}
          description="Tổng số khách hàng trong hệ thống"
          icon={Users}
          iconColor="text-success"
        />
        <StatCard
          title="Tổng lịch hẹn"
          value={`${stats.total_appointments}`}
          description="Bao gồm tất cả các trạng thái"
          icon={CreditCard}
          iconColor="text-warning"
        />
        <StatCard
          title="Hoạt động"
          value={`+${stats.activity_count}`}
          description={`${
            stats.activity_change_count >= 0 ? "+" : ""
          }${stats.activity_change_count} kể từ giờ trước`}
          icon={Activity}
          iconColor="text-info"
        />
      </div>
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
        <RevenueChart />
        <UpcomingAppointments />
      </div>
      {/* Bạn có thể thêm component TopSelling ở đây */}
    </div>
  );
}
