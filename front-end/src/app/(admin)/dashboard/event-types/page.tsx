// src/app/(admin)/dashboard/event-types/page.tsx
"use client";

import { CopyEventButton } from "@/components/common/CopyEventButton";
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
import { cn } from "@/lib/utils";
import { CalendarPlus, CalendarRange } from "lucide-react";
import Link from "next/link";
import { useEvents } from "@/features/event-types/hooks/useEvents";
import { FullPageLoader } from "@/components/ui/spinner";
import { Event } from "@/features/event-types/types";

export default function EventsPage() {
  const { data: events = [], isLoading } = useEvents();

  if (isLoading) {
    return <FullPageLoader text="Đang tải danh sách sự kiện..." />;
  }

  return (
    <>
      <div className="flex gap-4 items-baseline">
        <h1 className="text-3xl lg:text-4xl xl:text-5xl font-semibold mb-6">
          Events
        </h1>
        <Button asChild>
          <Link href="/dashboard/event-types/new">
            <CalendarPlus className="mr-4 size-6" /> New Event
          </Link>
        </Button>
      </div>
      {events.length > 0 ? (
        <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(400px,1fr))]">
          {events.map((event) => (
            <EventCard key={event.id} {...event} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 mt-16">
          <CalendarRange className="size-16 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">
            Bạn chưa có sự kiện nào. Hãy tạo sự kiện đầu tiên!
          </p>
          <Button size="lg" className="text-lg" asChild>
            <Link href="/dashboard/event-types/new">
              <CalendarPlus className="mr-4 size-6" /> Tạo Sự kiện mới
            </Link>
          </Button>
        </div>
      )}
    </>
  );
}

function EventCard({
  id,
  isActive,
  name,
  description,
  durationInMinutes,
  clerkUserId,
}: Event) {
  return (
    <Card className={cn("flex flex-col", !isActive && "border-secondary/50")}>
      <CardHeader className={cn(!isActive && "opacity-50")}>
        <CardTitle>{name}</CardTitle>
        <CardDescription>
          {formatEventDescription(durationInMinutes)}
        </CardDescription>
      </CardHeader>
      {description != null && (
        <CardContent className={cn(!isActive && "opacity-50")}>
          {description}
        </CardContent>
      )}
      <CardFooter className="flex justify-end gap-2 mt-auto">
        {isActive && (
          <CopyEventButton
            variant="outline"
            eventId={id}
            clerkUserId={clerkUserId}
          />
        )}
        <Button asChild>
          <Link href={`/dashboard/event-types/${id}/edit`}>Edit</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
