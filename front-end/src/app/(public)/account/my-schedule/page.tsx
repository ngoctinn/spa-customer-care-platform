// src/app/(public)/account/my-schedule/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LayoutGrid, List } from "lucide-react";

// --- IMPORT ĐÃ REFACTOR ---
import { FullPageLoader } from "@/components/ui/spinner";
import { PageHeader } from "@/components/common/PageHeader";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import ScheduleListView from "@/features/customer-schedules/components/ScheduleListView";
import ScheduleCalendarView from "@/features/customer-schedules/components/ScheduleCalendarView";
import { ReviewModal } from "@/features/review/components/ReviewModal";
import { Appointment } from "@/features/appointment/types";
import { ReviewFormValues } from "@/features/review/schemas";
import { NewReviewData } from "@/features/review/types";
import { updateAppointment } from "@/features/appointment/apis/appointment.api";
import { createReview } from "@/features/review/api/review.api";
import { ScheduleProvider } from "@/features/customer-schedules/contexts/ScheduleContext";
import { useServices } from "@/features/service/hooks/useServices";
import { useCustomerProfile } from "@/features/customer/hooks/useCustomerProfile";

export default function MySchedulePage() {
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const queryClient = useQueryClient();
  const router = useRouter();

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedAppointmentForReview, setSelectedAppointmentForReview] =
    useState<Appointment | null>(null);

  const { data: currentUserProfile, isLoading: isLoadingProfile } =
    useCustomerProfile();
  const { data: services = [], isLoading: isLoadingServices } = useServices();

  const handleNavigateToBooking = (date?: Date) => {
    let url = "/booking";
    if (date) {
      const formattedDate = date.toISOString().split("T")[0];
      url += `?date=${formattedDate}`;
    }
    router.push(url);
  };

  const cancelAppointmentMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      updateAppointment(id, {
        status: "cancelled",
        cancellation_reason: reason,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Đã hủy lịch hẹn thành công.");
    },
    onError: (error) => toast.error(`Hủy lịch thất bại: ${error.message}`),
  });

  const createReviewMutation = useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Cảm ơn bạn đã gửi đánh giá!");
      setIsReviewModalOpen(false);
    },
    onError: (error) => toast.error(`Gửi đánh giá thất bại: ${error.message}`),
  });

  const handleCancelAppointment = (id: string, reason: string) => {
    cancelAppointmentMutation.mutate({ id, reason });
  };

  const handleOpenReviewModal = (appointment: Appointment) => {
    setSelectedAppointmentForReview(appointment);
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmit = (values: ReviewFormValues) => {
    if (
      !selectedAppointmentForReview ||
      !currentUserProfile ||
      !selectedAppointmentForReview.technician_id
    ) {
      toast.error("Thiếu thông tin để gửi đánh giá.");
      return;
    }

    const reviewData: NewReviewData = {
      appointment_id: selectedAppointmentForReview.id,
      customer_id: currentUserProfile.id,
      technician_id: selectedAppointmentForReview.technician_id,
      item_id: selectedAppointmentForReview.service_id,
      item_type: "service", // Giả định review cho service
      rating: values.rating,
      comment: values.comment,
      images: [], // Tạm thời để trống
    };
    createReviewMutation.mutate(reviewData);
  };

  if (isLoadingProfile || isLoadingServices) {
    return <FullPageLoader text="Đang tải lịch trình của bạn..." />;
  }

  if (!currentUserProfile) {
    return <div className="p-6">Không tìm thấy thông tin khách hàng.</div>;
  }
  return (
    <ScheduleProvider>
      <div className="container mx-auto p-4 md:p-6 lg:p-8 h-full flex flex-col">
        <PageHeader
          title="Lịch trình của tôi"
          actionNode={
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value) => {
                if (value) setViewMode(value as "list" | "calendar");
              }}
            >
              <ToggleGroupItem value="list" aria-label="List view">
                <List className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="calendar" aria-label="Calendar view">
                <LayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          }
        />

        {viewMode === "list" ? (
          <ScheduleListView
            onCancelAppointment={handleCancelAppointment}
            onWriteReview={handleOpenReviewModal}
            onCreateAppointment={() => handleNavigateToBooking()}
          />
        ) : (
          <ScheduleCalendarView
            onCancelAppointment={handleCancelAppointment}
            onWriteReview={handleOpenReviewModal}
            onCreateAppointment={handleNavigateToBooking}
          />
        )}

        {/* ReviewModal đã được di chuyển và import từ vị trí mới */}
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          onSubmit={handleReviewSubmit}
          itemName={
            services.find(
              (s) => s.id === selectedAppointmentForReview?.service_id
            )?.name || "Dịch vụ"
          }
          isSubmitting={createReviewMutation.isPending}
        />
      </div>
    </ScheduleProvider>
  );
}
