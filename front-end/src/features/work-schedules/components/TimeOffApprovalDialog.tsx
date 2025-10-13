// src/features/work-schedules/components/TimeOffApprovalDialog.tsx
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
import { TimeOffRequest } from "../types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  approveTimeOffRequest,
  rejectTimeOffRequest,
} from "../api/schedule.api";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  request: TimeOffRequest;
}

export default function TimeOffApprovalDialog({
  isOpen,
  onClose,
  request,
}: Props) {
  const queryClient = useQueryClient();
  const hasConflicts = (request.conflicting_appointments?.length || 0) > 0;

  const { mutate: approve, isPending: isApproving } = useMutation({
    mutationFn: () => approveTimeOffRequest(request.id),
    onSuccess: () => {
      toast.success("Đã duyệt yêu cầu nghỉ phép.");
      queryClient.invalidateQueries({ queryKey: ["timeOffRequests"] });
      onClose();
    },
    onError: (err) =>
      toast.error("Duyệt thất bại", { description: err.message }),
  });

  const { mutate: reject, isPending: isRejecting } = useMutation({
    mutationFn: () => rejectTimeOffRequest(request.id),
    onSuccess: () => {
      toast.info("Đã từ chối yêu cầu nghỉ phép.");
      queryClient.invalidateQueries({ queryKey: ["timeOffRequests"] });
      onClose();
    },
    onError: (err) =>
      toast.error("Từ chối thất bại", { description: err.message }),
  });

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Duyệt yêu cầu nghỉ phép</AlertDialogTitle>
          <AlertDialogDescription>
            Xem lại thông tin và các xung đột (nếu có) trước khi quyết định.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {hasConflicts && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Cảnh báo xung đột lịch hẹn!</AlertTitle>
              <AlertDescription>
                Nhân viên này có {request.conflicting_appointments?.length} lịch
                hẹn đã đặt trong thời gian xin nghỉ. Vui lòng phân công lại
                trước khi duyệt.
              </AlertDescription>
            </Alert>
          )}
          {/* Chi tiết yêu cầu có thể thêm ở đây */}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={() => reject()}
            disabled={isRejecting || isApproving}
          >
            Từ chối
          </Button>
          <Button
            onClick={() => approve()}
            disabled={hasConflicts || isApproving || isRejecting}
          >
            Duyệt
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
