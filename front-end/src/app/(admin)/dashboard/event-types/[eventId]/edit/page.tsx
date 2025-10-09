// src/app/(admin)/dashboard/event-types/[eventId]/edit/page.tsx
"use client";

import { EventForm } from "@/features/scheduling/components/EventForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound, useParams } from "next/navigation";

// Dữ liệu giả lập, thay thế cho việc gọi database
const MOCK_EVENTS = [
  {
    id: "evt_1",
    name: "Tư vấn 30 phút",
    description: "Cuộc họp nhanh để trao đổi về dự án.",
    durationInMinutes: 30,
    isActive: true,
  },
  {
    id: "evt_2",
    name: "Họp chiến lược 1 giờ",
    description: "",
    durationInMinutes: 60,
    isActive: true,
  },
];

export default function EditEventPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  // Tìm sự kiện trong dữ liệu giả
  const event = MOCK_EVENTS.find((e) => e.id === eventId);

  // Nếu không tìm thấy, hiển thị trang 404
  if (!event) {
    return notFound();
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Chỉnh sửa Sự kiện</CardTitle>
      </CardHeader>
      <CardContent>
        <EventForm event={event} />
      </CardContent>
    </Card>
  );
}
