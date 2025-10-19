"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { applyPrepaidCard } from "@/features/prepaid-card/api/prepaid-card.api";

interface PrepaidCardInputProps {
  finalTotal: number;
}

export function PrepaidCardInput({ finalTotal }: PrepaidCardInputProps) {
  const { setValue } = useFormContext();
  const [prepaidCardCode, setPrepaidCardCode] = useState("");
  const [isApplyingCard, setIsApplyingCard] = useState(false);
  const [discount, setDiscount] = useState(0);

  const handleApplyPrepaidCard = async () => {
    if (!prepaidCardCode.trim()) {
      toast.warning("Vui lòng nhập mã thẻ.");
      return;
    }
    setIsApplyingCard(true);
    try {
      const result = await applyPrepaidCard({
        card_code: prepaidCardCode,
        total_amount: finalTotal,
      });
      setValue("prepaidCardCode", prepaidCardCode);
      setValue("prepaidCardDiscount", result.applicable_amount);
      setDiscount(result.applicable_amount);
      toast.success(
        `Đã áp dụng ${result.applicable_amount.toLocaleString(
          "vi-VN"
        )}đ từ thẻ trả trước.`
      );
    } catch (error: any) {
      toast.error("Áp dụng thẻ thất bại", { description: error.message });
    } finally {
      setIsApplyingCard(false);
    }
  };

  return (
    <>
      <Separator />
      <div className="space-y-2">
        <Label>Thẻ trả trước / Quà tặng</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Nhập mã thẻ..."
            value={prepaidCardCode}
            onChange={(e) => setPrepaidCardCode(e.target.value)}
            disabled={isApplyingCard || discount > 0}
          />
          <Button
            type="button"
            onClick={handleApplyPrepaidCard}
            disabled={isApplyingCard || discount > 0}
          >
            {isApplyingCard ? "Đang..." : "Áp dụng"}
          </Button>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm font-medium text-destructive">
            <span>Giảm giá từ thẻ</span>
            <span>-{discount.toLocaleString("vi-VN")}đ</span>
          </div>
        )}
      </div>
    </>
  );
}
