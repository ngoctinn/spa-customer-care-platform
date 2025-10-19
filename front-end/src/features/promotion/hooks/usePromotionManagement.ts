/**
 * @file src/features/promotion/hooks/usePromotionManagement.ts
 * @description Hook để quản lý logic CRUD cho khuyến mãi.
 */

import { useResourceManagement } from "@/features/management-pages/hooks/useResourceManagement";
import { Promotion, PromotionFormValues } from "@/features/promotion/types"; // Sửa đường dẫn import
import { promotionSchema } from "@/features/promotion/schemas"; // Sửa tên import
import {
  usePromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  QUERY_KEY_PROMOTIONS,
} from "@/features/promotion/api/promotion.api";

/**
 * @function usePromotionManagement
 * @description Hook tổng hợp, sử dụng useResourceManagement để cung cấp tất cả logic cần thiết
 * cho trang quản lý khuyến mãi.
 */
export const usePromotionManagement = () => {
  return useResourceManagement<Promotion, PromotionFormValues>({
    queryKey: [QUERY_KEY_PROMOTIONS],
    useDataHook: usePromotions,
    addFn: createPromotion,
    updateFn: updatePromotion,
    deleteFn: deletePromotion,
    formSchema: promotionSchema, // Sửa tên schema
    defaultFormValues: {
      name: "",
      description: "",
      discount_percentage: 0,
      date_range: {
        from: new Date(),
        to: new Date(),
      },
    },
    getEditFormValues: (promotion) => ({
      name: promotion.title, // Sửa thành promotion.title
      description: promotion.description || "",
      discount_percentage: promotion.discount_percent, // Sửa thành promotion.discount_percent
      date_range: {
        from: new Date(promotion.start_date),
        to: new Date(promotion.end_date),
      },
    }),
    customMessages: {
      addSuccess: "Tạo khuyến mãi thành công!",
      updateSuccess: "Cập nhật khuyến mãi thành công!",
      deleteSuccess: "Xóa khuyến mãi thành công!",
    },
  });
};
