// src/app/(admin)/dashboard/event-types/[eventId]/edit/page.tsx
"use client";

import { EventForm } from "@/features/event-types/components/EventForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound, useParams } from "next/navigation";
import { useEventById } from "@/features/event-types/hooks/useEvents";
import { FullPageLoader } from "@/components/ui/spinner";

export default function EditEventPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  const { data: event, isLoading, isError } = useEventById(eventId);

  if (isLoading) {
    return <FullPageLoader text="Đang tải sự kiện..." />;
  }

  if (isError || !event) {
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
