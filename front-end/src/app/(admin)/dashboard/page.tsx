// src/app/(admin)/dashboard/page.tsx
"use client";

import { StatCard } from "@/features/dashboard/components/StatCard";
import { RevenueChart } from "@/features/dashboard/components/RevenueChart";
import { UpcomingAppointments } from "@/features/dashboard/components/UpcomingAppointments";
import { DollarSign, Users, CreditCard, Activity } from "lucide-react";
import { useAppointments } from "@/features/appointment/hooks/useAppointments";
import { useCustomers } from "@/features/customer/hooks/useCustomers";
import { FullPageLoader } from "@/components/ui/spinner";

export default function DashboardPage() {
  const { data: appointments = [], isLoading: isLoadingAppointments } =
    useAppointments();
  const { data: customers = [], isLoading: isLoadingCustomers } =
    useCustomers();

  const isLoading = isLoadingAppointments || isLoadingCustomers;

  // Tính toán các chỉ số
  const totalRevenue = 1234567000; // Giữ dữ liệu giả lập hoặc thay bằng API
  const totalCustomers = customers.length;
  const totalAppointments = appointments.length;

  if (isLoading) {
    return <FullPageLoader text="Đang tải dữ liệu tổng quan..." />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Tổng quan</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title="Tổng doanh thu"
          value={`${new Intl.NumberFormat("vi-VN").format(totalRevenue)} ₫`}
          description="+20.1% so với tháng trước"
          icon={DollarSign}
        />
        <StatCard
          title="Tổng khách hàng"
          value={`+${totalCustomers}`}
          description="Tổng số khách hàng trong hệ thống"
          icon={Users}
          iconColor="text-green-500"
        />
        <StatCard
          title="Tổng lịch hẹn"
          value={`${totalAppointments}`}
          description="Bao gồm tất cả các trạng thái"
          icon={CreditCard}
          iconColor="text-orange-500"
        />
        <StatCard
          title="Hoạt động"
          value="+573"
          description="+201 kể từ giờ trước"
          icon={Activity}
          iconColor="text-blue-500"
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
