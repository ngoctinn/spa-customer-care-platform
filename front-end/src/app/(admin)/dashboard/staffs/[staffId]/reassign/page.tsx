// src/app/(admin)/dashboard/staffs/[staffId]/reassign/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStaffById } from "@/features/staff/hooks/useStaff";
import { useUpcomingAppointmentsByTechnician } from "@/features/appointment/hooks/useAppointments";
import { PageHeader } from "@/components/common/PageHeader";
import { FullPageLoader } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import ReassignmentCard from "@/features/staff/components/ReassignmentCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";

export default function ReassignAppointmentsPage() {
  const params = useParams();
  const router = useRouter();
  const staffId = params.staffId as string;

  const [reassignedIds, setReassignedIds] = useState<string[]>([]);

  const { data: staff, isLoading: isLoadingStaff } = useStaffById(staffId);
  const { data: appointments = [], isLoading: isLoadingAppointments } =
    useUpcomingAppointmentsByTechnician(staffId);

  const pendingAppointments = appointments.filter(
    (apt) => !reassignedIds.includes(apt.id)
  );
  const allReassigned =
    pendingAppointments.length === 0 && appointments.length > 0;

  // Cảnh báo người dùng khi họ cố gắng rời khỏi trang
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (pendingAppointments.length > 0) {
        e.preventDefault();
        e.returnValue = ""; // Bắt buộc cho một số trình duyệt
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [pendingAppointments.length]);

  const handleReassigned = (appointmentId: string) => {
    setReassignedIds((prev) => [...prev, appointmentId]);
  };

  const handleFinish = () => {
    router.push("/dashboard/staffs");
  };

  if (isLoadingStaff || isLoadingAppointments) {
    return <FullPageLoader text="Đang tải dữ liệu lịch hẹn..." />;
  }

  return (
    <>
      <PageHeader
        title={`Phân công lại lịch hẹn cho ${staff?.full_name || ""}`}
        description="Vui lòng phân công lại tất cả các lịch hẹn trong tương lai của nhân viên này."
        actionNode={
          <Button onClick={handleFinish} disabled={!allReassigned}>
            Hoàn tất
          </Button>
        }
      />

      {allReassigned ? (
        <Alert
          variant="default"
          className="bg-success/10 border-success/50 text-success"
        >
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Hoàn tất!</AlertTitle>
          <AlertDescription>
            Tất cả lịch hẹn đã được phân công lại. Bạn có thể rời khỏi trang
            này.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          {pendingAppointments.map((apt) => (
            <ReassignmentCard
              key={apt.id}
              appointment={apt}
              onReassigned={handleReassigned}
            />
          ))}
        </div>
      )}
    </>
  );
}
