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
  useAppointments,
  useAddAppointmentAdmin,
  useUpdateAppointment,
} from "@/features/appointment/hooks/useAppointments";
import { useCustomers } from "@/features/customer/hooks/useCustomers";
import { useServices } from "@/features/service/hooks/useServices";
import { useStaff } from "@/features/staff/hooks/useStaff";
import { FullPageLoader } from "@/components/ui/spinner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  appointmentFormSchema,
  AppointmentFormValues,
} from "@/features/appointment/schemas";
import { FormDialog } from "@/components/common/FormDialog";
import AppointmentForm from "@/features/appointment/components/AppointmentForm";
import { Appointment, AppointmentStatus } from "@/features/appointment/types";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { Card, CardContent } from "@/components/ui/card";
import { AppointmentDetailDialog } from "@/features/appointment/components/AppointmentDetailDialog";
import { DataTableFacetedFilter } from "@/components/common/data-table/data-table-faceted-filter";
import { toast } from "sonner";

const statusColors: Record<AppointmentStatus, string> = {
  upcoming: "hsl(var(--primary))",
  completed: "hsl(var(--success))",
  cancelled: "hsl(var(--destructive))",
  "checked-in": "hsl(var(--info))",
  "in-progress": "hsl(var(--warning))",
  "no-show": "hsl(var(--muted-foreground))",
  paused: "hsl(var(--warning))",
};

export default function AppointmentsPage() {
  const { data: appointments = [], isLoading: isLoadingAppointments } =
    useAppointments();
  const { data: customers = [], isLoading: isLoadingCustomers } =
    useCustomers();
  const { data: services = [], isLoading: isLoadingServices } = useServices();
  const { data: staffList = [], isLoading: isLoadingStaff } = useStaff();

  const addAppointmentMutation = useAddAppointmentAdmin();
  const updateAppointmentMutation = useUpdateAppointment();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [actionToConfirm, setActionToConfirm] = useState<{
    type: "check-in" | "cancel";
    appointmentId: string;
  } | null>(null);

  const [filters, setFilters] = useState<{ [key: string]: string[] }>({
    technician: [],
    service: [],
    status: [],
  });

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
  });

  // Giả lập một `table` object để `DataTableFacetedFilter` hoạt động
  const mockTable = {
    getColumn: (columnId: string) => ({
      getFilterValue: () => filters[columnId] || [],
      setFilterValue: (value: string[] | undefined) => {
        setFilters((prev) => ({ ...prev, [columnId]: value || [] }));
      },
    }),
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const techMatch =
        filters.technician.length === 0 ||
        (apt.technician_id && filters.technician.includes(apt.technician_id));
      const serviceMatch =
        filters.service.length === 0 ||
        filters.service.includes(apt.service_id);
      const statusMatch =
        filters.status.length === 0 || filters.status.includes(apt.status);
      return techMatch && serviceMatch && statusMatch;
    });
  }, [appointments, filters]);

  const calendarEvents = useMemo(() => {
    const customerMap = new Map(customers.map((c) => [c.id, c]));
    const serviceMap = new Map(services.map((s) => [s.id, s]));

    return filteredAppointments.map((apt) => ({
      id: apt.id,
      title:
        (customerMap.get(apt.customer_id)?.full_name ||
          apt.guest_name ||
          "Khách vãng lai") +
        ` - ${serviceMap.get(apt.service_id)?.name || "Dịch vụ"}`,
      start: new Date(apt.start_time),
      end: new Date(apt.end_time),
      extendedProps: { ...apt },
      backgroundColor: statusColors[apt.status],
      borderColor: statusColors[apt.status],
    }));
  }, [filteredAppointments, customers, services]);

  const handleEventClick = (clickInfo: EventClickArg) => {
    setSelectedAppointment(clickInfo.event.extendedProps as Appointment);
    setIsDetailOpen(true);
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
    form.reset({
      start_time: selectInfo.start,
    });
    setEditingAppointment(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: AppointmentFormValues) => {
    const mutation = editingAppointment
      ? updateAppointmentMutation
      : addAppointmentMutation;
    const mutationData = editingAppointment
      ? { id: editingAppointment.id, data }
      : data;

    mutation.mutate(mutationData as any, {
      onSuccess: () => setIsFormOpen(false),
    });
  };

  const handleConfirmAction = () => {
    if (!actionToConfirm) return;
    const { type, appointmentId } = actionToConfirm;
    const newStatus = type === "check-in" ? "checked-in" : "cancelled";

    updateAppointmentMutation.mutate(
      { id: appointmentId, data: { status: newStatus } },
      {
        onSuccess: () => {
          toast.success(
            `Đã ${
              type === "check-in" ? "check-in" : "hủy"
            } lịch hẹn thành công.`
          );
          setIsDetailOpen(false);
          setActionToConfirm(null);
        },
      }
    );
  };

  const isLoading =
    isLoadingAppointments ||
    isLoadingCustomers ||
    isLoadingServices ||
    isLoadingStaff;

  if (isLoading) {
    return <FullPageLoader text="Đang tải dữ liệu lịch hẹn..." />;
  }

  const technicianOptions = staffList.map((s) => ({
    label: s.full_name,
    value: s.id,
  }));
  const serviceOptions = services.map((s) => ({ label: s.name, value: s.id }));
  const statusOptions = [
    { label: "Sắp tới", value: "upcoming" },
    { label: "Hoàn thành", value: "completed" },
    { label: "Đã hủy", value: "cancelled" },
    { label: "Đã check-in", value: "checked-in" },
    { label: "Đang tiến hành", value: "in-progress" },
    { label: "Không đến", value: "no-show" },
  ];

  return (
    <>
      <PageHeader
        title="Quản lý Lịch hẹn"
        description="Xem, tạo và quản lý tất cả lịch hẹn của khách hàng."
        actionNode={
          <Button onClick={() => setIsFormOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Tạo lịch hẹn mới
          </Button>
        }
      />

      <Card className="mb-4">
        <CardContent className="p-2 flex flex-wrap items-center gap-2">
          <DataTableFacetedFilter
            column={mockTable.getColumn("technician") as any}
            title="Kỹ thuật viên"
            options={technicianOptions}
          />
          <DataTableFacetedFilter
            column={mockTable.getColumn("service") as any}
            title="Dịch vụ"
            options={serviceOptions}
          />
          <DataTableFacetedFilter
            column={mockTable.getColumn("status") as any}
            title="Trạng thái"
            options={statusOptions}
          />
        </CardContent>
      </Card>

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
        onClose={() => setIsDetailOpen(false)}
        appointment={selectedAppointment}
        onCheckIn={(id) =>
          setActionToConfirm({ type: "check-in", appointmentId: id })
        }
        onCancel={(id) =>
          setActionToConfirm({ type: "cancel", appointmentId: id })
        }
      />

      <FormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingAppointment ? "Chỉnh sửa lịch hẹn" : "Tạo lịch hẹn mới"}
        form={form}
        onFormSubmit={handleFormSubmit}
        isSubmitting={
          addAppointmentMutation.isPending ||
          updateAppointmentMutation.isPending
        }
      >
        <AppointmentForm />
      </FormDialog>

      <ConfirmationModal
        isOpen={!!actionToConfirm}
        onClose={() => setActionToConfirm(null)}
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
