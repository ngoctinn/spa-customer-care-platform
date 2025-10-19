// src/app/(admin)/dashboard/appointments/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { EventClickArg, EventDropArg, DateSelectArg } from "@fullcalendar/core";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  ColumnDef,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { toast } from "sonner";

import {
  useAppointments,
  useUpdateAppointment,
} from "@/features/appointment/hooks/useAppointments";
import { useCustomers } from "@/features/customer/hooks/useCustomers";
import { useServices } from "@/features/service/hooks/useServices";
import { useStaff } from "@/features/staff/hooks/useStaff";
import { useAppointmentModals } from "@/features/appointment/hooks/useAppointmentModals";

import { FullPageLoader } from "@/components/ui/spinner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { FormDialog } from "@/components/common/FormDialog";
import AppointmentForm from "@/features/appointment/components/AppointmentForm";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { Card, CardContent } from "@/components/ui/card";
import { AppointmentDetailDialog } from "@/features/appointment/components/AppointmentDetailDialog";
import { AppointmentFilters } from "@/features/appointment/components/AppointmentFilters";
import { Appointment, AppointmentStatus } from "@/features/appointment/types";

const statusColors: Record<AppointmentStatus, string> = {
  upcoming: "hsl(var(--primary))",
  completed: "hsl(var(--success))",
  cancelled: "hsl(var(--destructive))",
  "checked-in": "hsl(var(--info))",
  "in-progress": "hsl(var(--warning))",
  "no-show": "hsl(var(--muted-foreground))",
  paused: "hsl(var(--warning))",
};

// --- TÁI CẤU TRÚC: Định nghĩa cột cho react-table ---
const columns: ColumnDef<Appointment>[] = [
  { accessorKey: "service_id" },
  { accessorKey: "status" },
  {
    accessorKey: "assigned_staff_ids",
    filterFn: (row, id, value) => {
      return value.includes(row.original.assigned_staff_ids[0]);
    },
  },
];

export default function AppointmentsPage() {
  // --- Dữ liệu & Hooks ---
  const { data: appointments = [], isLoading: isLoadingAppointments } =
    useAppointments();
  const { data: customers = [], isLoading: isLoadingCustomers } =
    useCustomers();
  const { data: services = [], isLoading: isLoadingServices } = useServices();
  const { data: staffList = [], isLoading: isLoadingStaff } = useStaff();
  const updateAppointmentMutation = useUpdateAppointment();

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // --- TÁI CẤU TRÚC: Sử dụng useReactTable ---
  const table = useReactTable({
    data: appointments,
    columns,
    state: {
      columnFilters,
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const {
    form,
    isFormOpen,
    editingAppointment,
    isSubmitting,
    isDetailOpen,
    selectedAppointment,
    actionToConfirm,
    handleOpenForm,
    handleCloseForm,
    handleFormSubmit,
    handleOpenDetail,
    handleCloseDetail,
    handleOpenConfirmDialog,
    handleCloseConfirmDialog,
    handleConfirmAction,
  } = useAppointmentModals();

  // --- Logic & Callbacks ---
  const calendarEvents = useMemo(() => {
    const customerMap = new Map(customers.map((c) => [c.id, c]));
    const serviceMap = new Map(services.map((s) => [s.id, s]));

    // --- TÁI CẤU TRÚC: Lấy dữ liệu đã lọc từ table instance ---
    const filteredRows = table.getRowModel().rows;
    const filteredData = filteredRows.map((row) => row.original);

    return filteredData.map((apt) => ({
      id: apt.id,
      title: `${customerMap.get(apt.customer_id)?.full_name || "Khách"} - ${
        serviceMap.get(apt.service_id)?.name || "Dịch vụ"
      }`,
      start: new Date(apt.start_time),
      end: new Date(apt.end_time),
      extendedProps: { ...apt },
      backgroundColor: statusColors[apt.status],
      borderColor: statusColors[apt.status],
    }));
  }, [table.getRowModel().rows, customers, services]);

  const handleEventClick = (clickInfo: EventClickArg) => {
    handleOpenDetail(clickInfo.event.extendedProps as any);
  };

  const handleEventDrop = (dropInfo: EventDropArg) => {
    if (!dropInfo.event.start) {
      toast.error("Lỗi khi cập nhật thời gian sự kiện.");
      return;
    }
    updateAppointmentMutation.mutate({
      id: dropInfo.event.id,
      data: {
        start_time: dropInfo.event.start,
        end_time: dropInfo.event.end || dropInfo.event.start,
      },
    });
  };

  const handleSelect = (selectInfo: DateSelectArg) => {
    handleOpenForm(null, selectInfo.start);
  };

  // --- Render ---
  const isLoading =
    isLoadingAppointments ||
    isLoadingCustomers ||
    isLoadingServices ||
    isLoadingStaff;

  if (isLoading) {
    return <FullPageLoader text="Đang tải dữ liệu lịch hẹn..." />;
  }

  return (
    <>
      <PageHeader
        title="Quản lý Lịch hẹn"
        description="Xem, tạo và quản lý tất cả lịch hẹn của khách hàng."
        actionNode={
          <Button onClick={() => handleOpenForm()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Tạo lịch hẹn mới
          </Button>
        }
      />

      {/* --- TÁI CẤU TRÚC: Truyền table instance thật --- */}
      <AppointmentFilters
        table={table}
        staffList={staffList}
        services={services}
      />

      <Card>
        <CardContent className="p-4">
          <FullCalendar
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
              listPlugin,
            ]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
            }}
            initialView="timeGridWeek"
            events={calendarEvents}
            editable={true}
            selectable={true}
            select={handleSelect}
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            locale="vi"
            buttonText={{
              today: "Hôm nay",
              month: "Tháng",
              week: "Tuần",
              day: "Ngày",
              list: "Danh sách",
            }}
            allDaySlot={false}
          />
        </CardContent>
      </Card>

      <AppointmentDetailDialog
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        appointment={selectedAppointment}
        onCheckIn={(id) => handleOpenConfirmDialog("check-in", id)}
        onCancel={(id) => handleOpenConfirmDialog("cancel", id)}
      />

      <FormDialog
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={editingAppointment ? "Chỉnh sửa lịch hẹn" : "Tạo lịch hẹn mới"}
        form={form}
        onFormSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      >
        <AppointmentForm />
      </FormDialog>

      <ConfirmationModal
        isOpen={!!actionToConfirm}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleConfirmAction}
        title={`Xác nhận ${
          actionToConfirm?.type === "check-in" ? "Check-in" : "Hủy lịch"
        }`}
        description={`Bạn có chắc chắn muốn ${
          actionToConfirm?.type === "check-in" ? "check-in cho" : "hủy"
        } lịch hẹn này không?`}
        isDestructive={actionToConfirm?.type === "cancel"}
        confirmText="Xác nhận"
      />
    </>
  );
}
