"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AccountDashboardPage() {
  // Dữ liệu giả, bạn sẽ thay thế bằng API call trong thực tế
  const summary = {
    upcomingAppointments: 2,
    activeTreatments: 1,
    recentOrders: 3,
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold tracking-tight">
          Chào mừng trở lại!
        </h2>
        <p className="text-muted-foreground mt-1">
          Đây là tổng quan nhanh về tài khoản của bạn.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Lịch hẹn sắp tới
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.upcomingAppointments}
            </div>
            <p className="text-xs text-muted-foreground pt-2">
              Các cuộc hẹn đã được xác nhận.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href="/account/appointments">Xem chi tiết</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Liệu trình đang theo dõi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.activeTreatments}</div>
            <p className="text-xs text-muted-foreground pt-2">
              Liệu trình đang trong quá trình thực hiện.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href="/account/my-treatments">Quản lý liệu trình</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Đơn hàng gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.recentOrders}</div>
            <p className="text-xs text-muted-foreground pt-2">
              Trong vòng 30 ngày qua.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href="/account/order-history">Lịch sử mua hàng</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
