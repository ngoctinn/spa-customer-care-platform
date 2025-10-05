// src/features/appointment/hooks/useAvailability.ts
import { useQuery } from "@tanstack/react-query";
import { getAvailableSlots } from "@/features/appointment/apis/availability.api";

/**
 * Custom hook để lấy các khung giờ trống.
 * @param serviceId ID của dịch vụ.
 * @param selectedDate Ngày được chọn (đối tượng Date).
 */
export const useAvailability = (
  serviceId: string | undefined,
  selectedDate: Date | undefined,
  technicianId?: string // Thêm technicianId
) => {
  const dateString = selectedDate?.toISOString().split("T")[0];

  return useQuery<string[]>({
    queryKey: ["availability", serviceId, dateString, technicianId], // Thêm vào queryKey
    queryFn: () => getAvailableSlots(serviceId!, dateString!, technicianId),
    enabled: !!serviceId && !!dateString,
  });
};
