"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { usePosStore } from "@/features/checkout/stores/pos-store";
import PriceInput from "@/components/common/PriceInput";
import { PaymentMethod, PaymentRecord } from "@/features/checkout/types";
import { RewardPointsInput } from "@/features/checkout/components/RewardPointsInput";
import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useLoyaltySettings } from "@/features/loyalty/hooks/useLoyalty";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { applyPrepaidCard } from "@/features/prepaid-card/api/prepaid-card.api";
import { Label } from "@/components/ui/label";

const paymentMethods: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Tiền mặt" },
  { value: "card", label: "Thẻ" },
  { value: "transfer", label: "Chuyển khoản" },
  { value: "debt", label: "Ghi nợ" },
];

// Component con cho một dòng thanh toán
const PaymentRecordRow = ({
  index,
  onRemove,
}: {
  index: number;
  onRemove: () => void;
}) => {
  const { control } = useFormContext();
  return (
    <div className="flex items-end gap-2 p-3 border rounded-md">
      <FormField
        control={control}
        name={`payments.${index}.method`}
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormLabel>Phương thức</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`payments.${index}.amount`}
        render={() => (
          <FormItem>
            <FormLabel>Số tiền</FormLabel>
            <FormControl>
              <PriceInput name={`payments.${index}.amount`} label="Số tiền" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
};

export function PaymentDetails() {
  const { control, watch, setValue, setError, clearErrors } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "payments",
  });

  const { total, customer } = usePosStore();

  const discountFromPoints = watch("discountFromPoints") || 0;
  const prepaidCardDiscount = watch("prepaidCardDiscount") || 0;

  const [prepaidCardCode, setPrepaidCardCode] = useState("");
  const [isApplyingCard, setIsApplyingCard] = useState(false);

  const { data: loyaltySettings } = useLoyaltySettings();
  const pointsPerVnd = loyaltySettings?.points_per_vnd || 0;
  const vndPerPoint = pointsPerVnd > 0 ? 1 / pointsPerVnd : 0;

  const watchedPayments = watch("payments") as PaymentRecord[];
  const amountPaid =
    (watchedPayments || []).reduce(
      (sum, p) => sum + (Number(p.amount) || 0),
      0
    ) + prepaidCardDiscount;

  const finalTotal = total - discountFromPoints;
  const remainingAmount = finalTotal - amountPaid;

  const isCreditLimitExceeded = useMemo(() => {
    if (!customer) return false;

    const debtPayment = watchedPayments.find((p) => p.method === "debt");
    const debtPaymentIndex = watchedPayments.findIndex(
      (p) => p.method === "debt"
    );

    if (!debtPayment || debtPaymentIndex === -1) {
      clearErrors(`payments`); // Xóa tất cả lỗi trong mảng payments nếu không có ghi nợ
      return false;
    }

    const newDebtAmount = Math.max(0, remainingAmount);
    const currentDebt = customer.debt_amount || 0;
    const creditLimit = customer.credit_limit || 0;

    const willExceed = currentDebt + newDebtAmount > creditLimit;

    if (willExceed) {
      const maxAllowedDebt = Math.max(0, creditLimit - currentDebt);
      setError(`payments.${debtPaymentIndex}.amount`, {
        type: "manual",
        message: `Vượt hạn mức! (Tối đa: ${maxAllowedDebt.toLocaleString(
          "vi-VN"
        )}đ)`,
      });
    } else {
      clearErrors(`payments.${debtPaymentIndex}.amount`);
    }

    return willExceed;
  }, [watchedPayments, customer, remainingAmount, clearErrors, setError]);

  // Khởi tạo dòng thanh toán đầu tiên
  useEffect(() => {
    if (fields.length === 0) {
      append({ method: "cash", amount: finalTotal > 0 ? finalTotal : 0 });
    } else {
      const newAmount =
        finalTotal -
        watchedPayments
          .slice(1)
          .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      setValue(`payments.0.amount`, newAmount > 0 ? newAmount : 0, {
        shouldValidate: true,
      });
    }
  }, [finalTotal, fields.length, append, setValue, watchedPayments]);

  const handleApplyPoints = (points: number) => {
    if (!loyaltySettings) {
      toast.error("Không thể tải cấu hình điểm thưởng.");
      return;
    }
    const discountValue = Math.floor(points * vndPerPoint);

    if (discountValue > total) {
      toast.warning(
        "Số điểm áp dụng không được vượt quá tổng giá trị hóa đơn."
      );
      return;
    }
    // ++ ADDED ++: Lưu giá trị discount vào form
    setValue("pointsToRedeem", points);
    setValue("discountFromPoints", discountValue);
    toast.success(
      `Đã áp dụng giảm giá ${discountValue.toLocaleString("vi-VN")}đ từ điểm.`
    );
  };

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
    <div className="space-y-4">
      <Separator />
      <div className="flex justify-between font-bold text-lg">
        <span>Tổng cộng</span>
        <span>{total.toLocaleString("vi-VN")}đ</span>
      </div>

      {customer && (customer.loyalty_points ?? 0) > 0 && (
        <>
          <Separator />
          <RewardPointsInput
            availablePoints={customer.loyalty_points ?? 0}
            onApplyPoints={handleApplyPoints}
            vndPerPoint={vndPerPoint}
          />
        </>
      )}

      {discountFromPoints > 0 && (
        <div className="flex justify-between text-sm font-medium text-destructive">
          <span>Giảm giá từ điểm</span>
          <span>-{discountFromPoints.toLocaleString("vi-VN")}đ</span>
        </div>
      )}

      {/* Khu vực thẻ trả trước */}
      <Separator />
      <div className="space-y-2">
        <Label>Thẻ trả trước / Quà tặng</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Nhập mã thẻ..."
            value={prepaidCardCode}
            onChange={(e) => setPrepaidCardCode(e.target.value)}
            disabled={isApplyingCard || prepaidCardDiscount > 0}
          />
          <Button
            type="button"
            onClick={handleApplyPrepaidCard}
            disabled={isApplyingCard || prepaidCardDiscount > 0}
          >
            {isApplyingCard ? "Đang..." : "Áp dụng"}
          </Button>
        </div>
        {prepaidCardDiscount > 0 && (
          <div className="flex justify-between text-sm font-medium text-destructive">
            <span>Giảm giá từ thẻ</span>
            <span>-{prepaidCardDiscount.toLocaleString("vi-VN")}đ</span>
          </div>
        )}
      </div>

      <div className="flex justify-between font-bold text-lg text-primary">
        <span>Khách cần trả</span>
        <span>
          {(finalTotal > 0 ? finalTotal : 0).toLocaleString("vi-VN")}đ
        </span>
      </div>

      <Separator />
      <div className="space-y-3">
        <FormLabel>Chi tiết thanh toán</FormLabel>
        {fields.map((field, index) => (
          <PaymentRecordRow
            key={field.id}
            index={index}
            onRemove={() => remove(index)}
          />
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ method: "cash", amount: 0 })}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Thêm phương thức
        </Button>
      </div>

      {amountPaid > 0 && (
        <div className="flex justify-between text-sm pt-4">
          <span className="text-muted-foreground">
            {remainingAmount >= 0 ? "Còn lại" : "Tiền thừa trả khách"}
          </span>
          <span
            className={`font-medium ${
              remainingAmount < 0 ? "text-success font-bold text-base" : ""
            }`}
          >
            {Math.abs(remainingAmount).toLocaleString("vi-VN")}đ
          </span>
        </div>
      )}

      <FormField
        control={control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ghi chú đơn hàng</FormLabel>
            <FormControl>
              <Textarea placeholder="Thêm ghi chú..." {...field} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
