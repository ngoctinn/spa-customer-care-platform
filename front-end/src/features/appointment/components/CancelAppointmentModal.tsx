// src/features/appointment/components/CancelAppointmentModal.tsx
"use client";

import { useState } from "react";

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

interface CancelAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const CancelAppointmentModal = ({
  isOpen,
  onClose,
  onConfirm,
}: CancelAppointmentModalProps) => {
  const [reason, setReason] = useState("");

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
            Hành động này không thể hoàn tác. Vui lòng đọc kỹ chính sách hủy
            lịch của chúng tôi trước khi xác nhận.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
          <Label htmlFor="reason">Lý do hủy (không bắt buộc)</Label>
          <Textarea
            id="reason"
            placeholder="Nhập lý do của bạn..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        {/* === UI IMPROVEMENT START === */}
        <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md border">
          <p>
            <strong>Chính sách hủy lịch & hoàn tiền:</strong> Hủy lịch trước 24
            giờ sẽ được hoàn lại toàn bộ chi phí (nếu đã thanh toán) hoặc hoàn
            lại lượt sử dụng dịch vụ/liệu trình đã mua. Hủy lịch trong vòng 24
            giờ sẽ không được hoàn lại.
          </p>
        </div>
        {/* === UI IMPROVEMENT END === */}
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
