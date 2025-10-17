"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStaffById } from "@/features/staff/hooks/useStaff";
import { useUpcomingAppointmentsByTechnician } from "@/features/appointment/hooks/useAppointments";
import { completeOffboarding } from "@/features/staff/api/staff.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { FullPageLoader } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import ReassignmentCard from "@/features/staff/components/ReassignmentCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";

export default function ReassignAppointmentsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const staffId = params.staffId as string;

  const [reassignedIds, setReassignedIds] = useState<string[]>([]);

  const { data: staff, isLoading: isLoadingStaff } = useStaffById(staffId);
  const { data: appointments = [], isLoading: isLoadingAppointments } =
    useUpcomingAppointmentsByTechnician(staffId);

  // Mutation để hoàn tất quy trình off-boarding
  const completeOffboardingMutation = useMutation({
    mutationFn: () => completeOffboarding(staffId),
    onSuccess: () => {
      toast.success("Hoàn tất phân công lại và cho nhân viên nghỉ việc.");
      queryClient.invalidateQueries({ queryKey: ["staffList"] });
      router.push("/dashboard/staffs");
    },
    onError: (error) => {
      toast.error("Không thể hoàn tất", { description: error.message });
    },
  });

  const pendingAppointments = appointments.filter(
    (apt) => !reassignedIds.includes(apt.id)
  );
  const allReassigned =
    pendingAppointments.length === 0 && appointments.length > 0;

  // Cảnh báo người dùng khi họ cố gắng rời khỏi trang mà chưa hoàn tất
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (pendingAppointments.length > 0) {
        e.preventDefault();
        e.returnValue =
          "Bạn chưa phân công lại hết các lịch hẹn. Bạn có chắc muốn rời đi?";
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
    if (allReassigned) {
      completeOffboardingMutation.mutate();
    }
  };

  if (isLoadingStaff || isLoadingAppointments) {
    return <FullPageLoader text="Đang tải dữ liệu lịch hẹn..." />;
  }

  // Xử lý trường hợp không có lịch hẹn nào cần phân công ngay từ đầu
  if (appointments.length === 0 && !isLoadingAppointments) {
    return (
      <>
        <PageHeader
          title={`Phân công lại cho ${staff?.full_name || ""}`}
          description="Nhân viên này không có lịch hẹn nào trong tương lai."
        />
        <Alert
          variant="default"
          className="bg-success/10 border-success/50 text-success"
        >
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Không có lịch hẹn!</AlertTitle>
          <AlertDescription>
            Bạn có thể hoàn tất ngay để cho nhân viên nghỉ việc.
          </AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-end">
          <Button
            onClick={handleFinish}
            disabled={completeOffboardingMutation.isPending}
          >
            {completeOffboardingMutation.isPending
              ? "Đang xử lý..."
              : "Hoàn tất"}
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={`Phân công lại lịch hẹn cho ${staff?.full_name || ""}`}
        description={`Vui lòng phân công lại ${pendingAppointments.length} lịch hẹn còn lại của nhân viên này.`}
        actionNode={
          <Button
            onClick={handleFinish}
            disabled={!allReassigned || completeOffboardingMutation.isPending}
          >
            {completeOffboardingMutation.isPending
              ? "Đang xử lý..."
              : "Hoàn tất"}
          </Button>
        }
      />

      {allReassigned ? (
        <Alert
          variant="default"
          className="bg-success/10 border-success/50 text-success"
        >
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Hoàn tất phân công!</AlertTitle>
          <AlertDescription>
            Tất cả lịch hẹn đã được phân công lại. Nhấn "Hoàn tất" để xác nhận
            cho nhân viên nghỉ việc.
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
