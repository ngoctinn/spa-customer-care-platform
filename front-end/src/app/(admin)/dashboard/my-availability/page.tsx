// src/app/(admin)/dashboard/my-availability/page.tsx
import { ScheduleForm } from "@/features/event-types/components/ScheduleForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Định nghĩa kiểu dữ liệu cho một 'availability' để đảm bảo an toàn kiểu
type Availability = {
  dayOfWeek:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";
  startTime: string;
  endTime: string;
};

export default function SchedulePage() {
  // Dữ liệu giả lập, thay thế cho việc gọi database
  const schedule: { timezone: string; availabilities: Availability[] } = {
    timezone: "Asia/Ho_Chi_Minh",
    availabilities: [
      // SỬA LỖI: Đảm bảo các giá trị dayOfWeek khớp với kiểu dữ liệu mong đợi
      { dayOfWeek: "monday", startTime: "09:00", endTime: "17:00" },
      { dayOfWeek: "tuesday", startTime: "09:00", endTime: "17:00" },
      { dayOfWeek: "wednesday", startTime: "10:00", endTime: "16:00" },
    ],
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Lịch làm việc cá nhân</CardTitle>
      </CardHeader>
      <CardContent>
        <ScheduleForm schedule={schedule} />
      </CardContent>
    </Card>
  );
}
