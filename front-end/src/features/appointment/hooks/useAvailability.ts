// src/features/appointment/hooks/useAvailability.ts
import { useQuery } from "@tanstack/react-query";

import { getAvailableSlots } from "@/features/appointment/apis/availability.api";

const availabilityQueryKeys = {
  detail: (
    serviceId: string | undefined,
    dateString: string | undefined,
    technicianId?: string
  ) => ["availability", serviceId, dateString, technicianId] as const,
};

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
  const hasValidParams = Boolean(serviceId && dateString);

  return useQuery<string[]>({
    queryKey: availabilityQueryKeys.detail(serviceId, dateString, technicianId),
    queryFn: () =>
      getAvailableSlots(
        serviceId as string,
        dateString as string,
        technicianId
      ),
    enabled: hasValidParams,
  });
};
