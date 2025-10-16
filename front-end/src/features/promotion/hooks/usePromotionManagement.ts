// src/features/promotion/hooks/usePromotionManagement.ts
import { useResourceManagement } from "@/features/management-pages/hooks/useResourceManagement";
import { usePromotions } from "./usePromotions";
import { Promotion } from "../types";
import { PromotionFormValues, promotionFormSchema } from "../schemas";
import {
  addPromotion,
  updatePromotion,
  deletePromotion,
} from "../api/promotion.api";

export function usePromotionManagement() {
  return useResourceManagement<Promotion, PromotionFormValues>({
    queryKey: ["promotions"],
    useDataHook: usePromotions,
    addFn: addPromotion,
    updateFn: updatePromotion,
    deleteFn: deletePromotion,
    formSchema: promotionFormSchema,
    defaultFormValues: {
      title: "",
      description: "",
      discount_percent: 10,
      start_date: new Date(),
      end_date: new Date(new Date().setDate(new Date().getDate() + 7)),
    },
    getEditFormValues: (promotion) => ({
      ...promotion,
      start_date: new Date(promotion.start_date),
      end_date: new Date(promotion.end_date),
    }),
    customMessages: {
      addSuccess: "Thêm khuyến mãi thành công!",
      updateSuccess: "Cập nhật khuyến mãi thành công!",
      deleteSuccess: "Đã xóa khuyến mãi!",
    },
  });
}
