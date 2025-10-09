// src/features/customer-schedules/components/ScheduleListView.tsx
"use client";

import { useMemo } from "react";
import { PlusCircle } from "lucide-react";

// --- IMPORT ĐÃ REFACTOR ---
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Appointment } from "@/features/appointment/types";
import { ScheduleDataProps } from "@/features/customer-schedules/types";
import ActionRequiredList from "@/features/customer-schedules/components/ActionRequiredList";
import AppointmentCard from "@/features/customer-schedules/components/AppointmentCard";
import { useSchedule } from "@/features/customer-schedules/contexts/ScheduleContext";

interface ScheduleListViewProps {
  onCancelAppointment: (id: string, reason: string) => void;
  onWriteReview: (appointment: Appointment) => void;
  onCreateAppointment: () => void;
}

export default function ScheduleListView(props: ScheduleListViewProps) {
  const {
    appointments,
    currentUserProfile,
    services,
    staff,
    reviews,
    treatments,
    treatmentPlans,
  } = useSchedule();

  const { onCancelAppointment, onWriteReview, onCreateAppointment } = props;

  // --- LOGIC ĐÃ REFACTOR ---
  const { upcomingAppointments, historyItems } = useMemo(() => {
    if (!currentUserProfile) {
      return { upcomingAppointments: [], historyItems: [] };
    }

    const customerId = currentUserProfile.customer_profile.id;

    // Lọc các lịch hẹn của khách hàng hiện tại
    const customerAppointments = appointments.filter(
      (a) => a.customer_id === customerId
    );

    const now = new Date();

    const upcoming = customerAppointments
      .filter(
        (a) =>
          new Date(a.start_time) >= now &&
          (a.status === "upcoming" || a.status === "checked-in")
      )
      .sort(
        (a, b) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );

    const history = customerAppointments
      .filter(
        (a) =>
          new Date(a.start_time) < now ||
          (a.status !== "upcoming" && a.status !== "checked-in")
      )
      .sort(
        (a, b) =>
          new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
      );

    return {
      upcomingAppointments: upcoming,
      historyItems: history,
    };
  }, [appointments, currentUserProfile]);

  return (
    <Tabs defaultValue="upcoming">
      <TabsList className="grid w-full grid-cols-3 md:w-auto md:max-w-[500px] h-auto">
        <TabsTrigger value="upcoming">
          Sắp tới ({upcomingAppointments.length})
        </TabsTrigger>
        <TabsTrigger value="history">
          Lịch sử ({historyItems.length})
        </TabsTrigger>
        <TabsTrigger value="actions">Đã mua</TabsTrigger>
      </TabsList>

      <TabsContent value="actions" className="mt-4">
        <ActionRequiredList />
      </TabsContent>

      <TabsContent value="upcoming" className="mt-4">
        <div className="space-y-4">
          <div className="text-right">
            <Button onClick={onCreateAppointment}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Đặt lịch hẹn mới
            </Button>
          </div>
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((app) => {
              const service = services.find((s) => s.id === app.service_id);
              const technician = staff.find((t) => t.id === app.technician_id);
              if (!service) return null;

              return (
                <AppointmentCard
                  key={app.id}
                  appointment={app}
                  service={service}
                  technician={technician}
                  onCancel={onCancelAppointment}
                  onReview={onWriteReview}
                  hasReviewed={false} // Lịch hẹn sắp tới thì chưa thể review
                />
              );
            })
          ) : (
            <p className="text-muted-foreground p-4 text-center">
              Bạn không có lịch hẹn nào sắp tới.
            </p>
          )}
        </div>
      </TabsContent>

      <TabsContent value="history" className="mt-4">
        <div className="space-y-4">
          {historyItems.length > 0 ? (
            historyItems.map((app) => {
              const service = services.find((s) => s.id === app.service_id);
              const technician = staff.find((t) => t.id === app.technician_id);
              const hasReviewed = reviews.some(
                (r) => r.appointment_id === app.id
              );
              if (!service) return null;
              return (
                <AppointmentCard
                  key={app.id}
                  appointment={app}
                  service={service}
                  technician={technician}
                  onCancel={onCancelAppointment}
                  onReview={onWriteReview}
                  hasReviewed={hasReviewed}
                />
              );
            })
          ) : (
            <p className="text-muted-foreground p-4 text-center">
              Lịch sử lịch hẹn của bạn trống.
            </p>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
