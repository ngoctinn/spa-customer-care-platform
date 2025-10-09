// src/app/(public)/book/[clerkUserId]/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatEventDescription } from "@/lib/formatters";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";

// Định nghĩa kiểu dữ liệu cho EventCard để sửa lỗi 'any'
type EventCardProps = {
  id: string;
  name: string;
  clerkUserId: string;
  description: string | null;
  durationInMinutes: number;
};

// Dữ liệu giả lập
const MOCK_DATA = {
  user_123: {
    fullName: "John Doe",
    events: [
      {
        id: "evt_1",
        name: "Tư vấn 30 phút",
        description: "Trao đổi nhanh.",
        durationInMinutes: 30,
        clerkUserId: "user_123",
      },
      {
        id: "evt_2",
        name: "Họp 1 giờ",
        description: null,
        durationInMinutes: 60,
        clerkUserId: "user_123",
      },
    ],
  },
};

function EventCard({
  id,
  name,
  description,
  clerkUserId,
  durationInMinutes,
}: EventCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>
          {formatEventDescription(durationInMinutes)}
        </CardDescription>
      </CardHeader>
      {description != null && <CardContent>{description}</CardContent>}
      <CardFooter className="flex justify-end gap-2 mt-auto">
        <Button asChild>
          <Link href={`/book/${clerkUserId}/${id}`}>Chọn</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function BookingPage() {
  const params = useParams();
  const clerkUserId = params.clerkUserId as keyof typeof MOCK_DATA;

  const userData = MOCK_DATA[clerkUserId];

  if (!userData || userData.events.length === 0) {
    return notFound();
  }

  const { fullName, events } = userData;

  return (
    <div className="container mx-auto max-w-5xl py-12">
      <div className="text-4xl md:text-5xl font-semibold mb-4 text-center">
        {fullName}
      </div>
      <div className="text-muted-foreground mb-6 max-w-sm mx-auto text-center">
        Chào mừng đến trang đặt lịch của tôi. Vui lòng làm theo hướng dẫn để
        thêm một sự kiện vào lịch của tôi.
      </div>
      <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
        {events.map((event) => (
          <EventCard key={event.id} {...event} />
        ))}
      </div>
    </div>
  );
}
