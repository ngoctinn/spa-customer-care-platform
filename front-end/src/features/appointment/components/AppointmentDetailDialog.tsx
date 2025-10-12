// src/features/appointment/components/AppointmentDetailDialog.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Scissors,
  UserCog,
  Clock,
  Check,
  Ban,
  Wallet,
  FileText,
} from "lucide-react";
import { Appointment } from "@/features/appointment/types";
import { useCustomerById } from "@/features/customer/hooks/useCustomers";
import { useServiceById } from "@/features/service/hooks/useServices";
import { useStaffById } from "@/features/staff/hooks/useStaff";
import Link from "next/link";

interface AppointmentDetailDialogProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onCheckIn: (id: string) => void;
  onCancel: (id: string) => void;
}

export function AppointmentDetailDialog({
  appointment,
  isOpen,
  onClose,
  onCheckIn,
  onCancel,
}: AppointmentDetailDialogProps) {
  const { data: customer } = useCustomerById(appointment?.customer_id || "");
  const { data: service } = useServiceById(appointment?.service_id || "");
  const { data: technician } = useStaffById(appointment?.technician_id || "");

  if (!appointment) return null;

  const canCheckIn = appointment.status === "upcoming";
  const canCancel =
    appointment.status === "upcoming" || appointment.status === "checked-in";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            Chi tiết Lịch hẹn #{appointment.id.substring(0, 8)}
          </DialogTitle>
          <DialogDescription>
            <Badge>{appointment.status}</Badge>
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <div className="grid gap-4 py-4 text-sm">
          <div className="flex items-center gap-4">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-semibold">Thời gian</p>
              <p>
                {new Date(appointment.start_time).toLocaleString("vi-VN", {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-semibold">Khách hàng</p>
              <p>{customer?.full_name || appointment.guest_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Scissors className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-semibold">Dịch vụ</p>
              <p>{service?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <UserCog className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-semibold">Kỹ thuật viên</p>
              <p>{technician?.full_name || "Chưa chỉ định"}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Wallet className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-semibold">Thanh toán</p>
              <Badge
                variant={
                  appointment.payment_status === "paid"
                    ? "default"
                    : "destructive"
                }
              >
                {appointment.payment_status === "paid"
                  ? "Đã thanh toán"
                  : "Chưa thanh toán"}
              </Badge>
            </div>
          </div>
        </div>
        <Separator />
        <DialogFooter className="sm:justify-between">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/appointments/${appointment.id}`}>
                <FileText className="mr-2 h-4 w-4" /> Xem chi tiết
              </Link>
            </Button>
          </div>
          <div className="flex gap-2">
            {canCheckIn && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCheckIn(appointment.id)}
              >
                <Check className="mr-2 h-4 w-4" /> Check-in
              </Button>
            )}
            {canCancel && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onCancel(appointment.id)}
              >
                <Ban className="mr-2 h-4 w-4" /> Hủy lịch
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
