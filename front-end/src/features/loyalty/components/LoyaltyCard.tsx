// src/features/loyalty/components/LoyaltyCard.tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FullCustomerProfile } from "@/features/customer/types";
import { Award } from "lucide-react";

interface LoyaltyCardProps {
  customer: FullCustomerProfile;
}

export default function LoyaltyCard({ customer }: LoyaltyCardProps) {
  const currentTier = customer.loyalty_tier;
  const currentPoints = customer.loyalty_points || 0;

  // Giả sử API trả về mảng các cấp bậc đã sắp xếp theo điểm
  // Hoặc chúng ta cần lấy `loyaltySettings` để tìm cấp bậc tiếp theo
  // Ở đây, ta giả định đơn giản là có cấp bậc tiếp theo
  const nextTierPoints = (currentTier?.point_goal || 0) * 2 || 5000; // Giả định
  const progress = Math.min((currentPoints / nextTierPoints) * 100, 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-6 h-6 text-primary" />
          <span>Thành viên thân thiết</span>
        </CardTitle>
        <CardDescription>
          Cảm ơn bạn đã đồng hành cùng Serenity Spa.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-baseline p-4 rounded-lg bg-muted">
          <div>
            <p className="text-sm text-muted-foreground">Điểm hiện tại</p>
            <p className="text-3xl font-bold">
              {currentPoints.toLocaleString("vi-VN")}
            </p>
          </div>
          {currentTier && (
            <div
              className="px-3 py-1 rounded-full text-sm font-semibold text-foreground"
              style={{ backgroundColor: currentTier.color_hex }}
            >
              {currentTier.name}
            </div>
          )}
        </div>
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Tiến trình lên hạng</span>
            <span className="font-medium">
              {currentPoints.toLocaleString("vi-VN")} /{" "}
              {nextTierPoints.toLocaleString("vi-VN")}
            </span>
          </div>
          <Progress value={progress} />
          <p className="text-xs text-muted-foreground mt-2">
            Còn{" "}
            {Math.max(0, nextTierPoints - currentPoints).toLocaleString(
              "vi-VN"
            )}{" "}
            điểm nữa để lên hạng tiếp theo.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
