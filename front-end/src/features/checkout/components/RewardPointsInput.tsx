// src/features/checkout/components/RewardPointsInput.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Award } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface RewardPointsInputProps {
  availablePoints: number;
  onApplyPoints: (points: number) => void;
  vndPerPoint: number;
}

export function RewardPointsInput({
  availablePoints,
  onApplyPoints,
  vndPerPoint,
}: RewardPointsInputProps) {
  const [pointsToUse, setPointsToUse] = useState<number | string>("");

  const handleApply = () => {
    const points = Number(pointsToUse);
    if (isNaN(points) || points <= 0) {
      toast.warning("Vui lòng nhập số điểm hợp lệ.");
      return;
    }
    if (points > availablePoints) {
      toast.error("Bạn không có đủ điểm để sử dụng.");
      return;
    }
    onApplyPoints(points);
  };

  const conversionRateText =
    vndPerPoint > 0 ? `(1 điểm = ${vndPerPoint.toLocaleString("vi-VN")}đ)` : "";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Sử dụng điểm thưởng
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Bạn đang có:{" "}
          <span className="font-bold text-primary">
            {availablePoints.toLocaleString("vi-VN")}
          </span>{" "}
          điểm. {conversionRateText}
        </p>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Nhập số điểm muốn dùng"
            value={pointsToUse}
            onChange={(e) => setPointsToUse(e.target.value)}
            max={availablePoints}
          />
          <Button type="button" onClick={handleApply}>
            Đổi điểm
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
