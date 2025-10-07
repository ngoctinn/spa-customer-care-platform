// src/features/loyalty/hooks/useLoyalty.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLoyaltySettings, updateLoyaltySettings } from "../api/loyalty.api";
import { LoyaltySettings } from "../types";
import { toast } from "sonner";
import { LoyaltySettingsFormValues } from "@/features/loyalty/schemas";

const queryKey = ["loyaltySettings"];

export const useLoyaltySettings = () => {
  return useQuery<LoyaltySettings>({
    queryKey: queryKey,
    queryFn: getLoyaltySettings,
  });
};

export const useUpdateLoyaltySettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: LoyaltySettingsFormValues) =>
      updateLoyaltySettings(settings),
    onSuccess: () => {
      toast.success("Cập nhật cài đặt thành công!");
      queryClient.invalidateQueries({ queryKey: queryKey });
    },
    onError: (error) => {
      toast.error("Cập nhật thất bại", { description: error.message });
    },
  });
};
