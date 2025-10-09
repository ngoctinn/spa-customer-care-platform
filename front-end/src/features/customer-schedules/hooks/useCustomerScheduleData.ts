// src/features/customer-schedules/hooks/useCustomerScheduleData.ts
import { useQuery } from "@tanstack/react-query";

// --- IMPORT ĐÃ REFACTOR ---
import { useAuth } from "@/features/auth/contexts/AuthContexts";
import { useCustomerProfile } from "@/features/customer/hooks/useCustomerProfile"; // Sử dụng hook profile cá nhân
import { FullCustomerProfile } from "@/features/customer/types";
import { useServices } from "@/features/service/hooks/useServices";
import { useStaff } from "@/features/staff/hooks/useStaff"; // Đã đổi tên từ useStaffs thành useStaff
import { useReviews } from "@/features/review/hooks/useReviews";
import { useMemo } from "react";
import { TreatmentPackage } from "@/features/treatment/types";
import { useTreatmentPlans } from "@/features/treatment/hooks/useTreatmentPlans";
import { useAppointments } from "@/features/appointment/hooks/useAppointments";

// Giả lập API call, bạn sẽ thay thế bằng API thật
const getCustomerTreatments = async (
  customerId: string
): Promise<TreatmentPackage[]> => {
  // Đây là nơi bạn sẽ gọi API để lấy treatment packages của một customer
  console.log("Fetching treatments for customer:", customerId);
  return []; // Trả về mảng rỗng để không bị lỗi
};

export const useCustomerScheduleData = () => {
  const { user } = useAuth();

  // Sử dụng hook đã có để lấy profile, không cần fetch lại list customers
  const { data: currentUserProfile, isLoading: loadingProfile } =
    useCustomerProfile();

  // Lấy danh sách chung, sau đó filter ở client-side
  const { data: allAppointments = [], isLoading: loadingAppts } =
    useAppointments();
  const { data: allTreatments = [], isLoading: loadingTreatments } = useQuery({
    queryKey: ["customerTreatments", currentUserProfile?.customer_profile.id],
    queryFn: () =>
      getCustomerTreatments(currentUserProfile!.customer_profile.id),
    enabled: !!currentUserProfile,
  });

  // Filter appointments và treatments cho user hiện tại
  const appointments = useMemo(
    () =>
      allAppointments.filter(
        (appt) => appt.customer_id === currentUserProfile?.customer_profile.id
      ),
    [allAppointments, currentUserProfile]
  );
  const treatments = useMemo(
    () =>
      allTreatments.filter(
        (treat) => treat.customer_id === currentUserProfile?.customer_profile.id
      ),
    [allTreatments, currentUserProfile]
  );

  // Các hooks khác không đổi
  const { data: services = [], isLoading: loadingServices } = useServices();
  const { data: treatmentPlans = [], isLoading: loadingPlans } =
    useTreatmentPlans();
  const { data: staff = [], isLoading: loadingStaff } = useStaff();
  const { data: reviews = [], isLoading: loadingReviews } = useReviews();

  const isLoading =
    loadingProfile ||
    loadingAppts ||
    loadingTreatments ||
    loadingServices ||
    loadingPlans ||
    loadingStaff ||
    loadingReviews;

  return {
    isLoading,
    data: {
      appointments,
      treatments,
      services,
      treatmentPlans,
      staff,
      reviews,
      currentUserProfile: currentUserProfile as FullCustomerProfile, // Ép kiểu để phù hợp với component
    },
  };
};
