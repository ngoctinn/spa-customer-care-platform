// src/app/(admin)/dashboard/staff/[staffId]/schedule/page.tsx
"use client";

import { use } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { FullPageLoader } from "@/components/ui/spinner";
import { useStaffById } from "@/features/staff/hooks/useStaff"; // Sẽ tạo hook này
import { WorkScheduleForm } from "@/features/schedule/components/WorkScheduleForm"; // Sẽ tạo component này

interface SchedulePageProps {
  params: Promise<{ staffId: string }>;
}

export default function StaffSchedulePage({ params }: SchedulePageProps) {
  const { staffId } = use(params);
  const { data: staff, isLoading } = useStaffById(staffId);

  if (isLoading) {
    return <FullPageLoader text="Đang tải thông tin nhân viên..." />;
  }

  if (!staff) {
    return <div>Không tìm thấy nhân viên.</div>;
  }

  return (
    <>
      <PageHeader
        title={`Lịch Làm Việc - ${staff.full_name}`}
        description="Thiết lập giờ làm việc và ngày nghỉ cố định trong tuần cho nhân viên."
      />
      <WorkScheduleForm staffId={staffId} />
    </>
  );
}
