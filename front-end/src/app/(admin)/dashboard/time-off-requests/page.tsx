// src/app/(admin)/dashboard/time-off-requests/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/common/PageHeader";
import { getTimeOffRequests } from "@/features/work-schedules/api/schedule.api";
import { FullPageLoader } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TimeOffRequest } from "@/features/work-schedules/types";
import TimeOffApprovalDialog from "@/features/work-schedules/components/TimeOffApprovalDialog";
import { useStaff } from "@/features/staff/hooks/useStaff";
import { Badge } from "@/components/ui/badge";

export default function TimeOffRequestsPage() {
  const [selectedRequest, setSelectedRequest] = useState<TimeOffRequest | null>(
    null
  );

  const { data: requests = [], isLoading: isLoadingRequests } = useQuery({
    queryKey: ["timeOffRequests", "PENDING"],
    queryFn: () => getTimeOffRequests("PENDING"),
  });

  const { data: staffList = [], isLoading: isLoadingStaff } = useStaff();

  const staffMap = new Map(staffList.map((s) => [s.id, s.full_name]));

  if (isLoadingRequests || isLoadingStaff) {
    return <FullPageLoader text="Đang tải danh sách yêu cầu..." />;
  }

  return (
    <>
      <PageHeader
        title="Duyệt nghỉ phép"
        description="Xem và xử lý các yêu cầu xin nghỉ từ nhân viên."
      />
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nhân viên</TableHead>
                <TableHead>Thời gian bắt đầu</TableHead>
                <TableHead>Thời gian kết thúc</TableHead>
                <TableHead>Lý do</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Không có yêu cầu nào đang chờ xử lý.
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>{staffMap.get(req.user_id) || "N/A"}</TableCell>
                    <TableCell>
                      {new Date(req.start_time).toLocaleString("vi-VN")}
                    </TableCell>
                    <TableCell>
                      {new Date(req.end_time).toLocaleString("vi-VN")}
                    </TableCell>
                    <TableCell>{req.reason}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedRequest(req)}
                      >
                        Xem & Duyệt
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedRequest && (
        <TimeOffApprovalDialog
          request={selectedRequest}
          isOpen={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </>
  );
}
