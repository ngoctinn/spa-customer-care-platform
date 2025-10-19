// src/features/customer-schedules/hooks/useCustomerScheduleData.ts
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/contexts/AuthContexts";
import { useCustomerProfile } from "@/features/customer/hooks/useCustomerProfile";
import { FullCustomerProfile } from "@/features/customer/types";
import { useServices } from "@/features/service/hooks/useServices";
import { useStaff } from "@/features/staff/hooks/useStaff";
import { useReviews } from "@/features/review/hooks/useReviews";
import { TreatmentPackage } from "@/features/treatment/types";
import { useTreatmentPlans } from "@/features/treatment/hooks/useTreatmentPlans";
import { useAppointments } from "@/features/appointment/hooks/useAppointments"; // Sửa đổi ở đây

// Giả lập API call
const getCustomerTreatments = async (
  customerId: string
): Promise<TreatmentPackage[]> => {
  console.log("Fetching treatments for customer:", customerId);
  return [];
};

export const useCustomerScheduleData = () => {
  const { user } = useAuth();
  const { data: currentUserProfile, isLoading: loadingProfile } =
    useCustomerProfile();

  // THAY ĐỔI: Chỉ fetch appointments của user hiện tại
  const { data: appointments = [], isLoading: loadingAppts } = useAppointments({
    customer_id: currentUserProfile?.id,
  });

  const { data: treatments = [], isLoading: loadingTreatments } = useQuery({
    queryKey: ["customerTreatments", currentUserProfile?.id],
    queryFn: () => getCustomerTreatments(currentUserProfile!.id),
    enabled: !!currentUserProfile,
  });

  // Không cần useMemo để lọc lại nữa

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
      currentUserProfile: currentUserProfile as FullCustomerProfile,
    },
  };
};
