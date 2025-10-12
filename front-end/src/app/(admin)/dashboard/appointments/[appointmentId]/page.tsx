"use client";

import { useParams } from "next/navigation";
import { AdminDetailPageLayout } from "@/components/layout/admin/AdminDetailPageLayout";
import { FullPageLoader } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2, User, UserCog, Link as LinkIcon } from "lucide-react";
import { useAppointmentById } from "@/features/appointment/hooks/useAppointments";
import { useCustomerById } from "@/features/customer/hooks/useCustomers";
import { useStaffById } from "@/features/staff/hooks/useStaff";
import { useServiceById } from "@/features/service/hooks/useServices"; // Import đã chính xác
import { Appointment } from "@/features/appointment/types";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import React from "react";

// --- Sub-components ---
const AppointmentDetailsCard = ({
  appointment,
  serviceName,
}: {
  appointment: Appointment;
  serviceName: string;
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Chi tiết Lịch hẹn</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4 text-sm">
      <p>
        <strong className="w-24 inline-block">Dịch vụ:</strong> {serviceName}
      </p>
      <p>
        <strong className="w-24 inline-block">Thời gian:</strong>{" "}
        {new Date(appointment.start_time).toLocaleString("vi-VN")}
      </p>
      <p>
        <strong className="w-24 inline-block">Trạng thái:</strong>{" "}
        <Badge>{appointment.status}</Badge>
      </p>
    </CardContent>
  </Card>
);

const LinkedInfoCard = ({
  customerId,
  techId,
}: {
  customerId?: string;
  techId?: string;
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Thông tin liên quan</CardTitle>
    </CardHeader>
    <CardContent className="flex flex-col gap-2">
      {customerId && (
        <Button variant="outline" asChild>
          <Link href={`/dashboard/customers/${customerId}`}>
            <User className="mr-2 h-4 w-4" />
            Xem chi tiết khách hàng
          </Link>
        </Button>
      )}
      {techId && (
        <Button variant="outline" asChild>
          <Link href={`/dashboard/staffs/${techId}`}>
            <UserCog className="mr-2 h-4 w-4" />
            Xem chi tiết nhân viên
          </Link>
        </Button>
      )}
    </CardContent>
  </Card>
);

const PaymentStatusCard = ({ appointment }: { appointment: Appointment }) => (
  <Card>
    <CardHeader>
      <CardTitle>Thanh toán</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <p>
        <strong>Trạng thái:</strong>{" "}
        <Badge
          variant={
            appointment.payment_status === "paid" ? "default" : "destructive"
          }
        >
          {appointment.payment_status}
        </Badge>
      </p>
      {appointment.invoice_id && (
        <Button variant="outline">
          <LinkIcon className="mr-2 h-4 w-4" />
          Xem hóa đơn
        </Button>
      )}
    </CardContent>
  </Card>
);

const NotesCard = ({ appointment }: { appointment: Appointment }) => (
  <Card>
    <CardHeader>
      <CardTitle>Ghi chú</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4 text-sm italic">
      <div>
        <p className="font-semibold not-italic">Khách hàng:</p>
        <p className="text-muted-foreground">
          {appointment.customer_note || "Không có"}
        </p>
      </div>
      <div>
        <p className="font-semibold not-italic">Kỹ thuật viên:</p>
        <p className="text-muted-foreground">
          {appointment.technician_notes || "Chưa có"}
        </p>
      </div>
    </CardContent>
  </Card>
);

// --- Main Page ---
export default function AppointmentDetailPage() {
  const params = useParams();
  const appointmentId = params.appointmentId as string;

  const {
    data: appointment,
    isLoading: isLoadingAppt,
    isError,
  } = useAppointmentById(appointmentId);

  // Fetch related data
  const { data: customer } = useCustomerById(appointment?.customer_id || "");
  const { data: technician } = useStaffById(appointment?.technician_id || "");
  const { data: service } = useServiceById(appointment?.service_id || "");

  if (isLoadingAppt) {
    return <FullPageLoader text="Đang tải chi tiết lịch hẹn..." />;
  }

  if (isError || !appointment) {
    return <div>Không tìm thấy lịch hẹn.</div>;
  }

  const mainContent = (
    <>
      <NotesCard appointment={appointment} />
    </>
  );

  const sideContent = (
    <>
      <AppointmentDetailsCard
        appointment={appointment}
        serviceName={service?.name || "..."}
      />
      <LinkedInfoCard customerId={customer?.id} techId={technician?.id} />
      <PaymentStatusCard appointment={appointment} />
    </>
  );

  return (
    <AdminDetailPageLayout
      title={`Lịch hẹn #${appointment.id.substring(0, 8)}`}
      description={`Khách hàng: ${
        customer?.full_name || appointment.guest_name || "..."
      }`}
      actionButtons={
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </Button>
          <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Hủy lịch
          </Button>
        </div>
      }
      mainContent={mainContent}
      sideContent={sideContent}
    />
  );
}
