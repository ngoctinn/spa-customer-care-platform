// src/app/(public)/account/appointment-history/page.tsx
"use client";
import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataStateMessage } from "@/components/common/DataStateMessage";
import { FullPageLoader } from "@/components/ui/spinner";
import { useCustomerProfile } from "@/features/customer/hooks/useCustomerProfile";
import {
  useAppointments,
  useUpdateAppointment,
} from "@/features/appointment/hooks/useAppointments";
import { useServices } from "@/features/service/hooks/useServices";
import { useStaff } from "@/features/staff/hooks/useStaff";
import { useReviews } from "@/features/review/hooks/useReviews";
import AppointmentCard from "@/features/customer-schedules/components/AppointmentCard";
import { Appointment } from "@/features/appointment/types";
import { ReviewModal } from "@/features/review/components/ReviewModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createReview } from "@/features/review/api/review.api";
import { ReviewFormValues } from "@/features/review/schemas";
import { NewReviewData } from "@/features/review/types";
import { toast } from "sonner";

export default function AppointmentHistoryPage() {
  const queryClient = useQueryClient();
  const { data: customer, isLoading: isLoadingProfile } = useCustomerProfile();
  const { data: allAppointments = [], isLoading: isLoadingAppointments } =
    useAppointments();
  const { data: services = [], isLoading: isLoadingServices } = useServices();
  const { data: staff = [], isLoading: isLoadingStaff } = useStaff();
  const { data: reviews = [], isLoading: isLoadingReviews } = useReviews();

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedAppointmentForReview, setSelectedAppointmentForReview] =
    useState<Appointment | null>(null);

  const isLoading =
    isLoadingProfile ||
    isLoadingAppointments ||
    isLoadingServices ||
    isLoadingStaff ||
    isLoadingReviews;

  const historyAppointments = useMemo(() => {
    if (!customer) return [];
    return allAppointments
      .filter(
        (apt) =>
          apt.customer_id === customer.customer_profile.id &&
          (new Date(apt.start_time) < new Date() ||
            apt.status === "completed" ||
            apt.status === "cancelled" ||
            apt.status === "no-show")
      )
      .sort(
        (a, b) =>
          new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
      );
  }, [allAppointments, customer]);

  const createReviewMutation = useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Cảm ơn bạn đã gửi đánh giá!");
      setIsReviewModalOpen(false);
    },
    onError: (error) => toast.error(`Gửi đánh giá thất bại: ${error.message}`),
  });

  const handleOpenReviewModal = (appointment: Appointment) => {
    setSelectedAppointmentForReview(appointment);
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmit = (values: ReviewFormValues) => {
    if (
      !selectedAppointmentForReview ||
      !customer ||
      !selectedAppointmentForReview.technician_id
    ) {
      toast.error("Thiếu thông tin để gửi đánh giá.");
      return;
    }

    const reviewData: NewReviewData = {
      appointment_id: selectedAppointmentForReview.id,
      customer_id: customer.id,
      technician_id: selectedAppointmentForReview.technician_id,
      item_id: selectedAppointmentForReview.service_id,
      item_type: "service",
      rating: values.rating,
      comment: values.comment,
      images: [],
    };
    createReviewMutation.mutate(reviewData);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử đặt hẹn</CardTitle>
          <CardDescription>
            Xem lại các lịch hẹn dịch vụ đã đặt của bạn.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <FullPageLoader text="Đang tải lịch sử hẹn..." />
            </div>
          ) : historyAppointments.length === 0 ? (
            <DataStateMessage message="Bạn chưa có lịch hẹn nào trong quá khứ." />
          ) : (
            <div className="space-y-4">
              {historyAppointments.map((apt) => {
                const service = services.find((s) => s.id === apt.service_id);
                const technician = staff.find(
                  (t) => t.id === apt.technician_id
                );
                const hasReviewed = reviews.some(
                  (r) => r.appointment_id === apt.id
                );
                if (!service) return null;

                return (
                  <AppointmentCard
                    key={apt.id}
                    appointment={apt}
                    service={service}
                    technician={technician}
                    onCancel={() => {}} // No cancel action in history
                    onReview={handleOpenReviewModal}
                    hasReviewed={hasReviewed}
                  />
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
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
    </>
  );
}
