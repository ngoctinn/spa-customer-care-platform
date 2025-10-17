// src/features/appointment/components/CancelAppointmentModal.tsx
"use client";

import { useState, useEffect } from "react";

// --- IMPORT ĐÃ REFACTOR ---
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Appointment } from "@/features/appointment/types";

interface CancelAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  appointment?: Appointment | null; // Thêm appointment để kiểm tra thời gian
}

// Giả sử lấy từ API hoặc config
const CANCELLATION_POLICY = {
  freeCancellationHours: 24, // Hủy trước 24 giờ được miễn phí
  penaltyFeePercent: 50, // Phí phạt 50% nếu vi phạm
};

const CancelAppointmentModal = ({
  isOpen,
  onClose,
  onConfirm,
  appointment,
}: CancelAppointmentModalProps) => {
  const [reason, setReason] = useState("");
  const [showPenaltyWarning, setShowPenaltyWarning] = useState(false);

  useEffect(() => {
    if (appointment?.start_time) {
      const now = new Date();
      const startTime = new Date(appointment.start_time);
      const hoursUntilAppointment =
        (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursUntilAppointment < CANCELLATION_POLICY.freeCancellationHours) {
        setShowPenaltyWarning(true);
      } else {
        setShowPenaltyWarning(false);
      }
    }
  }, [appointment, isOpen]);

  const handleConfirm = () => {
    onConfirm(reason || "Khách hàng tự hủy");
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Bạn có chắc chắn muốn hủy lịch hẹn?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Hành động này không thể hoàn tác. Vui lòng đọc kỹ chính sách trước
            khi xác nhận.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4">
          {showPenaltyWarning && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Lưu ý về Chính sách Hủy lịch</AlertTitle>
              <AlertDescription>
                Vì bạn hủy lịch hẹn trong vòng{" "}
                {CANCELLATION_POLICY.freeCancellationHours} giờ, lượt sử dụng
                dịch vụ/liệu trình có thể sẽ không được hoàn lại theo chính sách
                của spa.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">Lý do hủy (không bắt buộc)</Label>
            <Textarea
              id="reason"
              placeholder="Nhập lý do của bạn..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Không</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive hover:bg-destructive/90"
          >
            Xác nhận hủy
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CancelAppointmentModal;
