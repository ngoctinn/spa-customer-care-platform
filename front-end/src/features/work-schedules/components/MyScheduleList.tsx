// src/features/work-schedules/components/MyScheduleList.tsx
import { FlexibleSchedule } from "@/features/work-schedules/types";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, HelpCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

// Helper Component để hiển thị danh sách ca đã đăng ký
const MyScheduleList = ({ schedules }: { schedules: FlexibleSchedule[] }) => {
  if (schedules.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Chưa có ca nào được đăng ký cho ngày này.
      </p>
    );
  }

  const statusMap = {
    pending: { icon: HelpCircle, color: "text-warning", label: "Chờ duyệt" },
    approved: { icon: CheckCircle, color: "text-success", label: "Đã duyệt" },
    rejected: { icon: XCircle, color: "text-destructive", label: "Đã từ chối" },
  };

  return (
    <div className="space-y-3 mt-4">
      <h3 className="font-semibold">Ca đã đăng ký</h3>
      {schedules.map((schedule) => {
        const status = statusMap[schedule.status];
        return (
          <div
            key={schedule.id}
            className="flex items-center justify-between p-3 border rounded-md bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <status.icon className={`h-5 w-5 ${status.color}`} />
              <div>
                <p className="font-medium">
                  {format(new Date(schedule.start_time), "HH:mm")} -{" "}
                  {format(new Date(schedule.end_time), "HH:mm")}
                </p>
                <Badge variant="outline">{status.label}</Badge>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MyScheduleList;
