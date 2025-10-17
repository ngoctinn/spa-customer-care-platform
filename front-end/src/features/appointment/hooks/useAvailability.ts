import { useQuery } from "@tanstack/react-query";
import { getAvailableSlots } from "@/features/appointment/apis/availability.api";

/**
 * Custom hook để lấy các khung giờ trống.
 * @param serviceId ID của dịch vụ.
 * @param selectedDate Ngày được chọn (đối tượng Date).
 * @param technicianIds (Tùy chọn) Mảng ID của các kỹ thuật viên.
 */
export const useAvailability = (
  serviceId: string | undefined,
  selectedDate: Date | undefined,
  technicianIds?: string[]
) => {
  const dateString = selectedDate?.toISOString().split("T")[0];

  return useQuery<string[]>({
    queryKey: ["availability", serviceId, dateString, technicianIds],
    queryFn: () => getAvailableSlots(serviceId!, dateString!, technicianIds),
    // Query sẽ chỉ được kích hoạt khi có đủ các tham số cần thiết.
    enabled: !!serviceId && !!dateString,
  });
};
