// src/features/booking/components/PackageSelection.tsx
"use client";

import { useCustomerPackages } from "@/features/treatment/hooks/useCustomerPackages";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FullPageLoader } from "@/components/ui/spinner";
import { TreatmentPackage } from "@/features/treatment/types";
import { Progress } from "@/components/ui/progress";
import { DataStateMessage } from "@/components/common/DataStateMessage";

interface PackageSelectionProps {
  treatmentId: string;
  onSelect: (pkg: TreatmentPackage) => void;
}

export default function PackageSelection({
  treatmentId,
  onSelect,
}: PackageSelectionProps) {
  const {
    data: packages = [],
    isLoading,
    isError,
    error,
  } = useCustomerPackages(treatmentId);

  if (isLoading) {
    return <FullPageLoader text="Đang tải các gói liệu trình của bạn..." />;
  }

  if (isError) {
    return (
      <DataStateMessage
        variant="error"
        message="Không thể tải dữ liệu"
        description={error.message}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bước 2: Chọn gói liệu trình của bạn</CardTitle>
        <CardDescription>
          Chọn một trong các gói liệu trình bạn đã mua để đặt lịch cho buổi tiếp
          theo.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {packages.length > 0 ? (
          packages.map((pkg) => (
            <Card
              key={pkg.id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => onSelect(pkg)}
            >
              <CardHeader>
                <CardTitle className="text-lg">
                  Gói mua ngày{" "}
                  {new Date(pkg.purchase_date).toLocaleDateString("vi-VN")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm mb-2">
                  <span>Tiến độ</span>
                  <span>
                    {pkg.completed_sessions} / {pkg.total_sessions} buổi
                  </span>
                </div>
                <Progress
                  value={(pkg.completed_sessions / pkg.total_sessions) * 100}
                />
              </CardContent>
            </Card>
          ))
        ) : (
          <DataStateMessage
            message="Không tìm thấy gói liệu trình"
            description="Bạn chưa mua gói liệu trình nào thuộc loại này hoặc đã hoàn thành tất cả."
          />
        )}
      </CardContent>
    </Card>
  );
}
