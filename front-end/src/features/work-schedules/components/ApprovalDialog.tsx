// src/features/work-schedules/components/ApprovalDialog.tsx
"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { FlexibleSchedule } from "@/features/work-schedules/types";

interface ApprovalDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  schedule: FlexibleSchedule | null;
  staffName: string;
  onApprove: () => void;
  onReject: () => void;
  isApproving: boolean;
  isRejecting: boolean;
}

export function ApprovalDialog({
  isOpen,
  onOpenChange,
  schedule,
  staffName,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}: ApprovalDialogProps) {
  if (!schedule) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận Ca làm việc</AlertDialogTitle>
          <AlertDialogDescription>
            <p>
              Nhân viên: <strong>{staffName}</strong>
            </p>
            <p>
              Thời gian:{" "}
              <strong>
                {new Date(schedule.start_time).toLocaleString("vi-VN")} -{" "}
                {new Date(schedule.end_time).toLocaleString("vi-VN")}
              </strong>
            </p>
            Bạn muốn duyệt hay từ chối ca làm việc này?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={onReject}
            disabled={isRejecting || isApproving}
          >
            <X className="mr-2 h-4 w-4" /> Từ chối
          </Button>
          <Button onClick={onApprove} disabled={isApproving || isRejecting}>
            <Check className="mr-2 h-4 w-4" /> Duyệt
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
