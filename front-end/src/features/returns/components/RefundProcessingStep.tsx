// src/features/returns/components/RefundProcessingStep.tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { FullCustomerProfile } from "@/features/customer/types";
import { RefundMethod, ReturnItem } from "../types";

interface RefundProcessingStepProps {
  customer: FullCustomerProfile | null;
  itemsToReturn: ReturnItem[];
  totalRefundAmount: number;
  refundMethod: RefundMethod;
  onRefundMethodChange: (method: RefundMethod) => void;
  reason: string;
  onReasonChange: (reason: string) => void;
}

export default function RefundProcessingStep({
  customer,
  itemsToReturn,
  totalRefundAmount,
  refundMethod,
  onRefundMethodChange,
  reason,
  onReasonChange,
}: RefundProcessingStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bước 3: Xử Lý Hoàn Tiền</CardTitle>
        <CardDescription>
          Kiểm tra lại thông tin và chọn phương thức hoàn tiền cho khách.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-semibold mb-2">Sản phẩm trả lại</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {itemsToReturn.map((item) => (
              <li key={item.productId} className="flex justify-between">
                <span>
                  {item.name} (SL: {item.quantity})
                </span>
                <span>
                  {(item.quantity * item.pricePerUnit).toLocaleString("vi-VN")}đ
                </span>
              </li>
            ))}
          </ul>
          <Separator className="my-3" />
          <div className="flex justify-between font-bold text-lg">
            <span>Tổng tiền hoàn lại</span>
            <span>{totalRefundAmount.toLocaleString("vi-VN")}đ</span>
          </div>
        </div>

        <div>
          <Label className="font-semibold">Phương thức hoàn tiền</Label>
          <RadioGroup
            value={refundMethod}
            onValueChange={(value: RefundMethod) => onRefundMethodChange(value)}
            className="mt-2 space-y-2"
          >
            <Label className="flex items-center gap-2 p-3 border rounded-md cursor-pointer hover:bg-muted/50">
              <RadioGroupItem value="cash" />
              Hoàn tiền mặt
            </Label>
            <Label className="flex items-center gap-2 p-3 border rounded-md cursor-pointer hover:bg-muted/50">
              <RadioGroupItem value="transfer" />
              Chuyển khoản
            </Label>
            {customer && (
              <Label className="flex items-center gap-2 p-3 border rounded-md cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="debt_credit" />
                Ghi có vào công nợ (Số dư nợ hiện tại:{" "}
                {(customer.debt_amount || 0).toLocaleString("vi-VN")}đ)
              </Label>
            )}
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="reason" className="font-semibold">
            Lý do trả hàng (Tùy chọn)
          </Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            className="mt-2"
            placeholder="VD: Sản phẩm lỗi, khách đổi ý..."
          />
        </div>
      </CardContent>
    </Card>
  );
}
