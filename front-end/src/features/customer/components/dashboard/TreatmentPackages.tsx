// src/features/customer/components/dashboard/TreatmentPackages.tsx
"use client";

import { useCustomerTreatmentPackages } from "../../hooks/useCustomerDashboard";
import { FullPageLoader } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataStateMessage } from "@/components/common/DataStateMessage";
import { TreatmentPackage } from "@/features/treatment/types";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const PackageItem = ({ pkg }: { pkg: TreatmentPackage }) => {
  const progress =
    pkg.total_sessions > 0
      ? (pkg.completed_sessions / pkg.total_sessions) * 100
      : 0;
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Liệu trình ID: {pkg.treatment_plan_id.substring(0, 8)}...
        </CardTitle>
        <CardDescription>
          Ngày mua: {new Date(pkg.purchase_date).toLocaleDateString("vi-VN")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-sm text-muted-foreground text-right">
            Đã hoàn thành {pkg.completed_sessions}/{pkg.total_sessions} buổi
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline">
          <Link href={`/treatment-plans/${pkg.treatment_plan_id}`}>
            Xem chi tiết liệu trình
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export function TreatmentPackages() {
  const {
    data: packages = [],
    isLoading,
    isError,
  } = useCustomerTreatmentPackages();

  if (isLoading) {
    return <FullPageLoader text="Đang tải các liệu trình của bạn..." />;
  }
  if (isError) {
    return (
      <DataStateMessage variant="error" message="Không thể tải dữ liệu." />
    );
  }

  return (
    <div className="space-y-6">
      {packages.length > 0 ? (
        packages.map((pkg) => <PackageItem key={pkg.id} pkg={pkg} />)
      ) : (
        <DataStateMessage message="Bạn chưa mua gói liệu trình nào." />
      )}
    </div>
  );
}
