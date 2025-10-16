import { useQuery } from "@tanstack/react-query";
import { getAvailableSlots } from "@/features/appointment/apis/availability.api";

/**
 * Custom hook để lấy các khung giờ trống.
 * @param serviceId ID của dịch vụ.
 * @param selectedDate Ngày được chọn (đối tượng Date).
 * @param technicianId (Tùy chọn) ID của kỹ thuật viên.
 */
export const useAvailability = (
  serviceId: string | undefined,
  selectedDate: Date | undefined,
  technicianId?: string
) => {
  const dateString = selectedDate?.toISOString().split("T")[0];

  return useQuery<string[]>({
    queryKey: ["availability", serviceId, dateString, technicianId],
    queryFn: () => getAvailableSlots(serviceId!, dateString!, technicianId),
    // Query sẽ chỉ được kích hoạt khi có đủ các tham số cần thiết.
    enabled: !!serviceId && !!dateString,
  });
};
