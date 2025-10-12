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
import { Edit, Trash2, Phone, Mail, Shield, CalendarClock } from "lucide-react";
import { useStaffById } from "@/features/staff/hooks/useStaff";
import { FullStaffProfile } from "@/features/staff/types";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import React from "react";

// --- Components for the Detail Page ---

// StaffInfoCard
const StaffInfoCard = ({ staff }: { staff: FullStaffProfile }) => (
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
        <span>{staff.email}</span>
      </div>
      <div className="flex items-center">
        <Phone className="mr-4 h-5 w-5 text-muted-foreground" />
        <span>{staff.phone || "Chưa cập nhật"}</span>
      </div>
      <div className="flex items-center">
        <Shield className="mr-4 h-5 w-5 text-muted-foreground" />
        <div className="flex flex-wrap gap-1">
          {staff.roles?.map((role) => (
            <Badge key={role.id}>{role.name}</Badge>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

// StaffActionsCard
const StaffActionsCard = ({ staffId }: { staffId: string }) => (
  <Card>
    <CardHeader>
      <CardTitle>Quản lý & Tác vụ</CardTitle>
      <CardDescription>
        Các hành động liên quan đến nhân viên này.
      </CardDescription>
    </CardHeader>
    <CardContent className="flex flex-col gap-2">
      <Button variant="outline" asChild>
        <Link href={`/dashboard/staffs/${staffId}/schedule`}>
          <CalendarClock className="mr-2 h-4 w-4" />
          Quản lý lịch làm việc
        </Link>
      </Button>
      <Button variant="outline" disabled>
        Phân công dịch vụ
      </Button>
    </CardContent>
  </Card>
);

// --- Main Page Component ---
export default function StaffDetailPage() {
  const params = useParams();
  const staffId = params.staffId as string;

  const { data: staff, isLoading, isError } = useStaffById(staffId);

  if (isLoading) {
    return <FullPageLoader text="Đang tải dữ liệu nhân viên..." />;
  }

  if (isError || !staff) {
    return (
      <div>
        <h2>Không tìm thấy nhân viên</h2>
        <Link href="/dashboard/staffs">
          <Button variant="outline">Quay lại</Button>
        </Link>
      </div>
    );
  }

  const mainContent = (
    <>
      {/* Future components like PerformanceStats can go here */}
      <Card>
        <CardHeader>
          <CardTitle>Thống kê hiệu suất (Sắp ra mắt)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Các chỉ số về hiệu suất làm việc của nhân viên sẽ được hiển thị ở
            đây.
          </p>
        </CardContent>
      </Card>
    </>
  );

  const sideContent = (
    <>
      <StaffInfoCard staff={staff} />
      <StaffActionsCard staffId={staff.id} />
    </>
  );

  return (
    <AdminDetailPageLayout
      title={staff.full_name}
      description={`Chi tiết nhân viên | Vai trò: ${
        staff.roles?.map((r) => r.name).join(", ") || "Chưa có"
      }`}
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
