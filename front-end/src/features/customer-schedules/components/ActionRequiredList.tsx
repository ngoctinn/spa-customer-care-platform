// src/features/customer-schedules/components/ActionRequiredList.tsx
"use client";

import { useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ActionableItem } from "@/features/customer-schedules/types";
import PurchasedItemCard from "@/features/customer-schedules/components/PurchasedItemCard";
import { DataStateMessage } from "@/components/common/DataStateMessage";
import { useSchedule } from "@/features/customer-schedules/contexts/ScheduleContext";

export default function ActionRequiredList() {
  const {
    appointments,
    treatments,
    services,
    treatmentPlans,
    staff,
    currentUserProfile,
  } = useSchedule();

  const actionableItems = useMemo(() => {
    const actions: ActionableItem[] = [];
    if (!currentUserProfile) return actions;

    const customerAppointments = appointments.filter(
      (a) => a.customer_id === currentUserProfile.id
    );
    const customerTreatments = treatments.filter(
      (t) => t.customer_id === currentUserProfile.id
    );

    // Lọc các dịch vụ lẻ đã mua còn lượt
    (currentUserProfile.purchased_services || []).forEach((ps) => {
      if (ps.quantity > 0) {
        actions.push({ type: "service", data: ps });
      }
    });

    // Lọc các liệu trình còn buổi và chưa có lịch hẹn sắp tới
    customerTreatments.forEach((pkg) => {
      if (pkg.completed_sessions < pkg.total_sessions) {
        const hasUpcomingSessionForPackage = customerAppointments.some(
          (app) =>
            app.treatment_package_id === pkg.id && app.status === "upcoming"
        );
        if (!hasUpcomingSessionForPackage) {
          actions.push({ type: "treatment", data: pkg });
        }
      }
    });

    return actions;
  }, [appointments, treatments, currentUserProfile, treatmentPlans]);

  return (
    <ScrollArea className="flex-grow mt-4">
      <div className="space-y-4 pr-4">
        {actionableItems.length > 0 ? (
          actionableItems.map((item, index) => {
            if (item.type === "treatment") {
              const pkg = item.data;
              const planInfo = treatmentPlans.find(
                (p) => p.id === pkg.treatment_plan_id
              );
              return (
                <PurchasedItemCard
                  key={`treat-${pkg.id}-${index}`}
                  item={{ type: "treatment", data: pkg, details: planInfo }}
                  staffList={staff}
                  serviceList={services}
                  isCompleted={false}
                  hasReviewed={false}
                  onWriteReview={() => {}}
                />
              );
            }
            if (item.type === "service") {
              const purchased = item.data;
              const serviceInfo = services.find(
                (s) => s.id === purchased.service_id
              );
              return (
                <PurchasedItemCard
                  key={`serv-${purchased.service_id}-${index}`}
                  item={{
                    type: "service",
                    data: purchased,
                    details: serviceInfo,
                  }}
                  staffList={staff}
                  serviceList={services}
                  isCompleted={false}
                  hasReviewed={false}
                  onWriteReview={() => {}}
                />
              );
            }
            return null;
          })
        ) : (
          <DataStateMessage message="Bạn không có mục nào cần thực hiện." />
        )}
      </div>
    </ScrollArea>
  );
}
