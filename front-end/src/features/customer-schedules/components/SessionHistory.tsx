// src/features/customer-schedules/components/SessionHistory.tsx
import Link from "next/link";

// --- IMPORT ĐÃ REFACTOR ---
import { TreatmentSession } from "@/features/treatment/types";
import { FullStaffProfile } from "@/features/staff/types";
import { Service } from "@/features/service/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";

interface SessionHistoryProps {
  sessions: TreatmentSession[];
  staffList: FullStaffProfile[];
  serviceList: Service[];
  treatmentPackageId: string;
}

export default function SessionHistory({
  sessions,
  staffList,
  serviceList,
  treatmentPackageId,
}: SessionHistoryProps) {
  // Tối ưu việc tìm kiếm bằng cách sử dụng Map
  const staffMap = useMemo(
    () => new Map(staffList.map((s) => [s.id, s])),
    [staffList]
  );
  const serviceMap = useMemo(
    () => new Map(serviceList.map((s) => [s.id, s])),
    [serviceList]
  );

  // Sắp xếp các buổi theo thứ tự tăng dần
  const sortedSessions = useMemo(
    () =>
      [...sessions].sort(
        (a, b) => a.treatment_plan_step - b.treatment_plan_step
      ),
    [sessions]
  );

  return (
    <div>
      <h4 className="text-lg font-semibold mb-2">Lịch sử các buổi</h4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Buổi</TableHead>
            <TableHead>Dịch vụ</TableHead>
            <TableHead>Ngày thực hiện</TableHead>
            <TableHead>Kỹ thuật viên</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedSessions.map((session) => {
            // --- LOGIC ĐÃ REFACTOR ---
            // Lấy thông tin appointment liên quan đến session
            // (Giả sử session có `appointment` object được populated từ backend)
            const appointment = (session as any).appointment;
            const technician = appointment
              ? staffMap.get(appointment.technician_id)
              : undefined;
            const service = appointment
              ? serviceMap.get(appointment.service_id)
              : undefined;

            return (
              <TableRow key={session.id}>
                <TableCell>Buổi {session.treatment_plan_step}</TableCell>
                <TableCell className="font-medium">
                  {service?.name || "N/A"}
                </TableCell>
                <TableCell>
                  {appointment?.start_time
                    ? new Date(appointment.start_time).toLocaleDateString(
                        "vi-VN"
                      )
                    : "Chưa đặt lịch"}
                </TableCell>
                <TableCell>{technician?.full_name || "N/A"}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      session.status === "completed" ? "default" : "secondary"
                    }
                  >
                    {session.status === "completed" ? "Hoàn thành" : "Sắp tới"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {session.status === "upcoming" && !appointment && service && (
                    <Button asChild size="sm">
                      <Link
                        href={`/booking?treatmentPackageId=${treatmentPackageId}&sessionId=${session.id}&serviceId=${service.id}`}
                      >
                        Đặt lịch
                      </Link>
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
