// src/features/staff/components/PendingOffboardingNotice.tsx
"use client";

import { useStaff } from "@/features/staff/hooks/useStaff";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

export default function PendingOffboardingNotice() {
  const { data: staffList = [], isLoading } = useStaff();

  const pendingStaff = useMemo(() => {
    return staffList.filter(
      (staff) => staff.employment_status === "pending_offboarding"
    );
  }, [staffList]);

  if (isLoading || pendingStaff.length === 0) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Hành động đang chờ xử lý</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <div>
          <p>
            Có <span className="font-bold">{pendingStaff.length}</span> nhân
            viên đang trong quy trình nghỉ việc và cần được phân công lại lịch
            hẹn.
          </p>
          <ul className="list-disc pl-5 mt-1 text-xs">
            {pendingStaff.map((staff) => (
              <li key={staff.id}>{staff.full_name}</li>
            ))}
          </ul>
        </div>
        <Button asChild variant="destructive" size="sm">
          <Link href={`/dashboard/staffs/${pendingStaff[0].id}/reassign`}>
            Xử lý ngay <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
}
