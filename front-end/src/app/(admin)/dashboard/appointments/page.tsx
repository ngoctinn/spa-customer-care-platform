// src/app/(admin)/dashboard/appointments/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { EventClickArg, EventDropArg } from "@fullcalendar/core";

import {
  useAppointments,
  useAddAppointmentAdmin,
  useUpdateAppointment,
  useDeleteAppointment,
} from "@/features/appointment/hooks/useAppointments";
import { useCustomers } from "@/features/customer/hooks/useCustomers";
import { useServices } from "@/features/service/hooks/useServices";
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
import { Appointment } from "@/features/appointment/types";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { Card, CardContent } from "@/components/ui/card";

// Bạn cần thêm file CSS này để FullCalendar có style cơ bản
// import "@fullcalendar/common/main.css";
// import "@fullcalendar/daygrid/main.css";
// import "@fullcalendar/timegrid/main.css";

export default function AppointmentsPage() {
  const { data: appointments = [], isLoading: isLoadingAppointments } =
    useAppointments();
  const { data: customers = [], isLoading: isLoadingCustomers } =
    useCustomers();
  const { data: services = [], isLoading: isLoadingServices } = useServices();

  const addAppointmentMutation = useAddAppointmentAdmin();
  const updateAppointmentMutation = useUpdateAppointment();
  const deleteAppointmentMutation = useDeleteAppointment();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] =
    useState<Appointment | null>(null);

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
  });

  const calendarEvents = useMemo(() => {
    const customerMap = new Map(customers.map((c) => [c.id, c]));
    const serviceMap = new Map(services.map((s) => [s.id, s]));

    return appointments.map((apt) => {
      const customer = customerMap.get(apt.customer_id);
      const service = serviceMap.get(apt.service_id);
      return {
        id: apt.id,
        title: customer
          ? `${customer.full_name} - ${service?.name}`
          : `(Khách vãng lai) - ${service?.name}`,
        start: apt.start_time,
        end: apt.end_time,
        extendedProps: { ...apt },
      };
    });
  }, [appointments, customers, services]);

  const handleEventClick = (clickInfo: EventClickArg) => {
    // Mở dialog chi tiết hoặc dialog chỉnh sửa
    const appointment = clickInfo.event.extendedProps as Appointment;
    setEditingAppointment(appointment);
    form.reset({
      customer_id: appointment.customer_id,
      service_id: appointment.service_id,
      technician_id: appointment.technician_id,
      start_time: new Date(appointment.start_time),
      customer_note: appointment.customer_note,
    });
    setIsFormOpen(true);
  };

  const handleEventDrop = (dropInfo: EventDropArg) => {
    if (!dropInfo.event.start) {
      console.error("Event drop resulted in a null start time.");
      // Có thể hiển thị toast báo lỗi ở đây nếu cần
      return;
    }
    // Gọi API để cập nhật thời gian
    updateAppointmentMutation.mutate({
      id: dropInfo.event.id,
      data: {
        // Sử dụng toán tử `??` để chuyển `null` thành `undefined`
        start_time: dropInfo.event.start,
        end_time: dropInfo.event.end ?? undefined,
      },
    });
  };

  const handleOpenAddForm = () => {
    setEditingAppointment(null);
    form.reset();
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: AppointmentFormValues) => {
    if (editingAppointment) {
      updateAppointmentMutation.mutate(
        { id: editingAppointment.id, data },
        {
          onSuccess: () => setIsFormOpen(false),
        }
      );
    } else {
      addAppointmentMutation.mutate(data, {
        onSuccess: () => setIsFormOpen(false),
      });
    }
  };

  const handleConfirmDelete = () => {
    if (appointmentToDelete) {
      deleteAppointmentMutation.mutate(appointmentToDelete.id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setAppointmentToDelete(null);
          setIsFormOpen(false); // Đóng cả form edit nếu đang mở
        },
      });
    }
  };

  if (isLoadingAppointments || isLoadingCustomers || isLoadingServices) {
    return <FullPageLoader text="Đang tải dữ liệu lịch hẹn..." />;
  }

  return (
    <>
      <PageHeader
        title="Quản lý Lịch hẹn"
        description="Xem, tạo và quản lý tất cả lịch hẹn của khách hàng."
        actionNode={
          <Button onClick={handleOpenAddForm}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Tạo lịch hẹn mới
          </Button>
        }
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
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            locale="vi" // Hỗ trợ tiếng Việt
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
        <div className="space-y-4">
          <AppointmentForm />
          {editingAppointment && (
            <Button
              variant="destructive"
              type="button"
              className="w-full"
              onClick={() => {
                setAppointmentToDelete(editingAppointment);
                setIsDeleteDialogOpen(true);
              }}
            >
              Hủy lịch hẹn này
            </Button>
          )}
        </div>
      </FormDialog>

      <ConfirmationModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận hủy lịch hẹn"
        description="Bạn có chắc chắn muốn hủy lịch hẹn này không? Hành động này không thể hoàn tác."
        isDestructive
        confirmText="Xác nhận hủy"
      />
    </>
  );
}
