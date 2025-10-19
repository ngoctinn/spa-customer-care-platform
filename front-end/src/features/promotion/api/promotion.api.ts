import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { Promotion, PromotionFormValues } from "@/features/promotion/types";

const PROMOTION_API_ENDPOINT = "/promotions";
export const QUERY_KEY_PROMOTIONS = "promotions";

/**
 * @function getPromotions
 * @description Lấy danh sách tất cả khuyến mãi.
 */
export const getPromotions = async (): Promise<Promotion[]> => {
  return apiClient<Promotion[]>(PROMOTION_API_ENDPOINT);
};

/**
 * @function createPromotion
 * @description Tạo một khuyến mãi mới.
 */
export const createPromotion = async (
  data: PromotionFormValues
): Promise<Promotion> => {
  const payload = {
    ...data,
    start_date: data.date_range.from.toISOString(),
    end_date: data.date_range.to.toISOString(),
  };
  return apiClient<Promotion>(PROMOTION_API_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

/**
 * @function updatePromotion
 * @description Cập nhật một khuyến mãi.
 */
export const updatePromotion = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<PromotionFormValues>;
}): Promise<Promotion> => {
  const payload = data.date_range
    ? {
        ...data,
        start_date: data.date_range.from.toISOString(),
        end_date: data.date_range.to.toISOString(),
      }
    : data;

  return apiClient<Promotion>(`${PROMOTION_API_ENDPOINT}/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

/**
 * @function deletePromotion
 * @description Xóa một khuyến mãi.
 */
export const deletePromotion = async (id: string): Promise<void> => {
  return apiClient<void>(`${PROMOTION_API_ENDPOINT}/${id}`, {
    method: "DELETE",
  });
};

/**
 * @function usePromotions
 * @description Hook để lấy danh sách tất cả khuyến mãi từ server.
 */
export const usePromotions = () => {
  return useQuery<Promotion[], Error>({
    queryKey: [QUERY_KEY_PROMOTIONS],
    queryFn: getPromotions,
  });
};
