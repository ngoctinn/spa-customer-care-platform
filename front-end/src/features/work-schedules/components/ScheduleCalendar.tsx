// src/features/work-schedules/components/ScheduleCalendar.tsx
"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import {
  EventClickArg,
  EventContentArg,
  DateSelectArg,
} from "@fullcalendar/core";

interface ScheduleCalendarProps {
  events: any[];
  onEventClick: (clickInfo: EventClickArg) => void;
  onDateSelect: (selectInfo: DateSelectArg) => void;
  onDatesSet: (dateInfo: { start: Date; end: Date }) => void;
}

const renderEventContent = (eventInfo: EventContentArg) => (
  <div className="p-1 w-full overflow-hidden">
    <b>{eventInfo.timeText}</b>
    <p className="whitespace-nowrap overflow-hidden text-ellipsis">
      {eventInfo.event.title}
    </p>
  </div>
);

export function ScheduleCalendar({
  events,
  onEventClick,
  onDateSelect,
  onDatesSet,
}: ScheduleCalendarProps) {
  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
      }}
      initialView="timeGridWeek"
      events={events}
      eventClick={onEventClick}
      eventContent={renderEventContent}
      locale="vi"
      buttonText={{
        today: "Hôm nay",
        month: "Tháng",
        week: "Tuần",
        day: "Ngày",
        list: "Danh sách",
      }}
      allDaySlot={false}
      datesSet={onDatesSet}
      selectable={true}
      selectMirror={true}
      select={onDateSelect}
    />
  );
}
