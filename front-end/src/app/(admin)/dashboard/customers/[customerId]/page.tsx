"use client";

import { useParams } from "next/navigation";
import { AdminDetailPageLayout } from "@/components/layout/admin/AdminDetailPageLayout";
import { FullPageLoader } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Edit,
  Trash2,
  Phone,
  Mail,
  StickyNote,
  Award,
  DollarSign,
  CalendarDays,
  Heart,
} from "lucide-react";
import { useCustomerById } from "@/features/customer/hooks/useCustomers";
import { FullCustomerProfile } from "@/features/customer/types";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import React from "react";

// --- Components for the Detail Page ---

// CustomerInfoCard
const CustomerInfoCard = ({ customer }: { customer: FullCustomerProfile }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle>Thông tin cá nhân</CardTitle>
      <Button variant="outline" size="sm">
        <Edit className="mr-2 h-4 w-4" />
        Chỉnh sửa
      </Button>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex items-center">
        <Mail className="mr-4 h-5 w-5 text-muted-foreground" />
        <span>{customer.email}</span>
      </div>
      <div className="flex items-center">
        <Phone className="mr-4 h-5 w-5 text-muted-foreground" />
        <span>{customer.phone || "Chưa cập nhật"}</span>
      </div>
      <Separator />
      <div className="space-y-2">
        <div className="flex items-start">
          <StickyNote className="mr-4 h-5 w-5 text-muted-foreground flex-shrink-0" />
          <div>
            <h4 className="font-semibold">Ghi chú nội bộ</h4>
            <p className="text-muted-foreground text-sm italic">
              {customer.customer_profile.notes || "Không có ghi chú nào."}
            </p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// CustomerLoyaltyCard
const CustomerLoyaltyCard = ({
  customer,
}: {
  customer: FullCustomerProfile;
}) => {
  const currentTier = customer.loyalty_tier;
  const currentPoints = customer.customer_profile.loyalty_points || 0;
  const nextTierPoints = (currentTier?.point_goal || 0) * 2 || 5000;
  const progress = Math.min((currentPoints / nextTierPoints) * 100, 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-warning" />
          Thành viên thân thiết
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="font-bold text-2xl">
            {currentPoints.toLocaleString("vi-VN")} điểm
          </span>
          {currentTier && (
            <Badge
              style={{ backgroundColor: currentTier.color_hex, color: "white" }}
            >
              {currentTier.name}
            </Badge>
          )}
        </div>
        <div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Còn{" "}
            {Math.max(0, nextTierPoints - currentPoints).toLocaleString(
              "vi-VN"
            )}{" "}
            điểm để lên hạng tiếp theo.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// CustomerStats
const CustomerStats = () => (
  <div className="grid grid-cols-3 gap-4">
    <Card className="text-center">
      <CardHeader>
        <CardTitle className="text-2xl">15.2M</CardTitle>
        <CardDescription className="flex items-center justify-center gap-2">
          <DollarSign className="h-4 w-4" /> Tổng chi tiêu
        </CardDescription>
      </CardHeader>
    </Card>
    <Card className="text-center">
      <CardHeader>
        <CardTitle className="text-2xl">28</CardTitle>
        <CardDescription className="flex items-center justify-center gap-2">
          <CalendarDays className="h-4 w-4" /> Số lần đến
        </CardDescription>
      </CardHeader>
    </Card>
    <Card className="text-center">
      <CardHeader>
        <CardTitle className="text-base">Chăm sóc da</CardTitle>
        <CardDescription className="flex items-center justify-center gap-2">
          <Heart className="h-4 w-4" /> Dịch vụ
        </CardDescription>
      </CardHeader>
    </Card>
  </div>
);

// Mock Data for lists
const mockAppointments = [
  {
    id: "apt1",
    service: "Chăm sóc da mặt",
    date: "2025-09-28",
    status: "Hoàn thành",
  },
  {
    id: "apt2",
    service: "Massage body",
    date: "2025-10-15",
    status: "Sắp tới",
  },
];
const mockOrders = [
  { id: "ord1", total: 1200000, date: "2025-09-28", status: "Đã thanh toán" },
  { id: "ord2", total: 750000, date: "2025-08-12", status: "Đã thanh toán" },
];

// RecentAppointmentsList
const RecentAppointmentsList = () => (
  <Card>
    <CardHeader>
      <CardTitle>Lịch hẹn gần đây</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Dịch vụ</TableHead>
            <TableHead>Ngày</TableHead>
            <TableHead>Trạng thái</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockAppointments.map((apt) => (
            <TableRow key={apt.id}>
              <TableCell className="font-medium">{apt.service}</TableCell>
              <TableCell>{apt.date}</TableCell>
              <TableCell>
                <Badge
                  variant={apt.status === "Sắp tới" ? "default" : "secondary"}
                >
                  {apt.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

// RecentOrdersList
const RecentOrdersList = () => (
  <Card>
    <CardHeader>
      <CardTitle>Đơn hàng gần đây</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã đơn</TableHead>
            <TableHead>Ngày</TableHead>
            <TableHead>Tổng tiền</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockOrders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">
                {order.id.toUpperCase()}
              </TableCell>
              <TableCell>{order.date}</TableCell>
              <TableCell>{order.total.toLocaleString("vi-VN")}đ</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

// --- Main Page Component ---
export default function CustomerDetailPage() {
  const params = useParams();
  const customerId = params.customerId as string;

  const { data: customer, isLoading, isError } = useCustomerById(customerId);

  if (isLoading) {
    return <FullPageLoader text="Đang tải dữ liệu khách hàng..." />;
  }

  if (isError || !customer) {
    return (
      <div>
        <h2>Không tìm thấy khách hàng</h2>
        <Link href="/dashboard/customers">
          <Button variant="outline">Quay lại</Button>
        </Link>
      </div>
    );
  }

  const mainContent = (
    <>
      <CustomerStats />
      <RecentAppointmentsList />
      <RecentOrdersList />
    </>
  );

  const sideContent = (
    <>
      <CustomerInfoCard customer={customer} />
      <CustomerLoyaltyCard customer={customer} />
    </>
  );

  return (
    <AdminDetailPageLayout
      title={customer.full_name}
      description={`Chi tiết khách hàng, ID: ${customer.id}`}
      actionButtons={
        <Button variant="destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Vô hiệu hóa
        </Button>
      }
      mainContent={mainContent}
      sideContent={sideContent}
    />
  );
}
