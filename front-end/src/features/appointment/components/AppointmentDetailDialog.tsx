"use client";

import { useState, useMemo } from "react";
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
  Gift,
  CreditCard,
  Users, // Bổ sung icon Users
} from "lucide-react";
import { Appointment } from "@/features/appointment/types";
import { useCustomerById } from "@/features/customer/hooks/useCustomers";
import { useServiceById } from "@/features/service/hooks/useServices";
import { useStaff } from "@/features/staff/hooks/useStaff";
import Link from "next/link";
import ApplyPurchasedItemDialog from "./ApplyPurchasedItemDialog";

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
  const [isApplyItemDialogOpen, setIsApplyItemDialogOpen] = useState(false);

  const { data: customer } = useCustomerById(appointment?.customer_id || "");
  const { data: service } = useServiceById(appointment?.service_id || "");

  // Lấy danh sách tất cả nhân viên
  const { data: allStaff = [] } = useStaff();

  // TỐI ƯU HÓA: Sử dụng Map để tra cứu nhân viên hiệu quả hơn
  const staffMap = useMemo(() => {
    return new Map(allStaff.map((staff) => [staff.id, staff]));
  }, [allStaff]);

  const assignedStaff = useMemo(() => {
    if (!appointment || !staffMap.size) return [];
    // Sử dụng map.get() cho tra cứu O(1)
    return appointment.assigned_staff_ids
      .map((id) => staffMap.get(id))
      .filter((staff): staff is NonNullable<typeof staff> => !!staff); // Lọc ra các giá trị undefined nếu không tìm thấy
  }, [appointment, staffMap]);

  if (!appointment) return null;

  const canCheckIn = appointment.status === "upcoming";
  const canCancel =
    appointment.status === "upcoming" || appointment.status === "checked-in";
  const isUnpaid = appointment.payment_status === "unpaid";
  const isNotInPackage = !appointment.treatment_package_id;

  const handleApplySuccess = () => {
    setIsApplyItemDialogOpen(false);
    onClose();
  };

  return (
    <>
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
            {/* THAY ĐỔI: Hiển thị danh sách nhân viên */}
            <div className="flex items-start gap-4">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-semibold">Nhân viên thực hiện</p>
                {assignedStaff.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {assignedStaff.map((staff) => (
                      <li key={staff.id}>{staff.full_name}</li>
                    ))}
                  </ul>
                ) : (
                  <p>Chưa chỉ định</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Wallet className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-semibold">Thanh toán</p>
                {isNotInPackage ? (
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
                ) : (
                  <Badge variant="secondary">Thuộc liệu trình</Badge>
                )}
              </div>
            </div>
          </div>
          <Separator />
          <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2">
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
            <div className="flex gap-2">
              {isUnpaid && isNotInPackage && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsApplyItemDialogOpen(true)}
                  >
                    <Gift className="mr-2 h-4 w-4" /> Áp dụng gói đã mua
                  </Button>
                  <Button size="sm" asChild>
                    <Link
                      href={`/dashboard/pos?appointmentId=${appointment.id}`}
                    >
                      <CreditCard className="mr-2 h-4 w-4" /> Thanh toán
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {customer && (
        <ApplyPurchasedItemDialog
          isOpen={isApplyItemDialogOpen}
          onClose={() => setIsApplyItemDialogOpen(false)}
          appointment={appointment}
          customer={customer}
          onSuccess={handleApplySuccess}
        />
      )}
    </>
  );
}
