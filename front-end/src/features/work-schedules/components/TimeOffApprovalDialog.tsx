// src/features/work-schedules/components/TimeOffApprovalDialog.tsx
"use client";

import { useState } from "react";
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
import { decideTimeOffRequest } from "../api/schedule.api"; // Sử dụng hàm đúng
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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
  const [decisionNote, setDecisionNote] = useState("");
  const hasConflicts = (request.conflicting_appointments?.length || 0) > 0;

  const { mutate: decide, isPending } = useMutation({
    mutationFn: (decision: {
      status: "da_duyet" | "tu_choi";
      decision_note?: string;
    }) => decideTimeOffRequest(request.id, decision),
    onSuccess: (_, variables) => {
      if (variables.status === "da_duyet") {
        toast.success("Đã duyệt yêu cầu nghỉ phép.");
      } else {
        toast.info("Đã từ chối yêu cầu nghỉ phép.");
      }
      queryClient.invalidateQueries({ queryKey: ["timeOffRequests"] });
      onClose();
    },
    onError: (err) =>
      toast.error("Thao tác thất bại", { description: err.message }),
  });

  const handleApprove = () => {
    decide({ status: "da_duyet", decision_note: decisionNote });
  };

  const handleReject = () => {
    decide({ status: "tu_choi", decision_note: decisionNote });
  };

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
          <div className="text-sm space-y-1">
            <p>
              <span className="text-muted-foreground">Nhân viên:</span>{" "}
              <strong>{request.user_id}</strong> {/* Cần map sang tên NV */}
            </p>
            <p>
              <span className="text-muted-foreground">Lý do:</span>{" "}
              <em>{request.reason}</em>
            </p>
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="decision-note">Ghi chú (Tùy chọn)</Label>
            <Textarea
              id="decision-note"
              placeholder="Thêm ghi chú cho quyết định của bạn..."
              value={decisionNote}
              onChange={(e) => setDecisionNote(e.target.value)}
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={isPending}
          >
            Từ chối
          </Button>
          <Button onClick={handleApprove} disabled={hasConflicts || isPending}>
            Duyệt
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
