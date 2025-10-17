"use client";

import { useMemo } from "react";
import { useAuth } from "@/features/auth/contexts/AuthContexts";
import { useCustomerProfile } from "@/features/customer/hooks/useCustomerProfile";
import { useServices } from "@/features/service/hooks/useServices";
import { useTreatmentPlans } from "@/features/treatment/hooks/useTreatmentPlans";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { FullPageLoader, Spinner } from "@/components/ui/spinner";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { TreatmentPackage } from "@/features/treatment/types";
import { useRouter } from "next/navigation";

interface ServiceSelectionProps {
  onSelect: (id: string, type: "service" | "treatment") => void;
}

// Giả lập API call, bạn sẽ thay thế bằng API thật
const getCustomerTreatments = async (
  customerId: string
): Promise<TreatmentPackage[]> => {
  console.log("Fetching treatments for customer:", customerId);
  // Trong thực tế, bạn sẽ gọi API endpoint để lấy các gói liệu trình của khách hàng.
  // Ví dụ: return apiClient<TreatmentPackage[]>(`/customers/${customerId}/packages`);
  return Promise.resolve([]); // Trả về mảng rỗng để không bị lỗi
};

// Component con để hiển thị các mục đã mua
const PurchasedItems = ({ onSelect }: ServiceSelectionProps) => {
  const { data: profile, isLoading: isLoadingProfile } = useCustomerProfile();
  const { data: allServices, isLoading: isLoadingServices } = useServices();
  const { data: allPlans, isLoading: isLoadingPlans } = useTreatmentPlans();

  // Lấy các gói liệu trình đã mua của khách hàng
  const { data: purchasedPackages = [], isLoading: isLoadingPackages } =
    useQuery({
      queryKey: ["customerTreatments", profile?.id],
      queryFn: () => getCustomerTreatments(profile!.id),
      enabled: !!profile,
    });

  const purchasedItems = useMemo(() => {
    if (!profile) return [];

    const items = [];

    // Lọc dịch vụ lẻ đã mua còn lượt
    const purchasedServices =
      profile.purchased_services?.filter((ps) => ps.quantity > 0) || [];

    for (const ps of purchasedServices) {
      const serviceDetails = allServices?.find((s) => s.id === ps.service_id);
      if (serviceDetails) {
        items.push({
          type: "service" as const,
          id: serviceDetails.id,
          name: serviceDetails.name,
          info: `Còn ${ps.quantity} lượt`,
        });
      }
    }

    // Lọc các gói liệu trình chưa hoàn thành
    const unfinishedPackages = purchasedPackages.filter(
      (p) => p.completed_sessions < p.total_sessions
    );

    for (const pkg of unfinishedPackages) {
      const planDetails = allPlans?.find((p) => p.id === pkg.treatment_plan_id);
      if (planDetails) {
        items.push({
          type: "treatment" as const,
          id: planDetails.id,
          name: planDetails.name,
          info: `Đã hoàn thành ${pkg.completed_sessions}/${pkg.total_sessions} buổi`,
          progress: (pkg.completed_sessions / pkg.total_sessions) * 100,
        });
      }
    }

    return items;
  }, [profile, purchasedPackages, allServices, allPlans]);

  if (
    isLoadingProfile ||
    isLoadingServices ||
    isLoadingPlans ||
    isLoadingPackages
  ) {
    return (
      <div className="flex justify-center items-center p-4">
        <Spinner />
        <span className="ml-2">Đang tải các dịch vụ của bạn...</span>
      </div>
    );
  }

  if (purchasedItems.length === 0) {
    return null; // Không hiển thị gì nếu không có mục nào
  }

  return (
    <Card className="bg-muted/50 border-primary/50">
      <CardHeader>
        <CardTitle>Sử dụng dịch vụ & liệu trình đã mua</CardTitle>
        <CardDescription>
          Chọn một mục bên dưới để bắt đầu đặt lịch hẹn cho buổi tiếp theo.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {purchasedItems.map((item) => (
          <div
            key={`${item.type}-${item.id}`}
            className="flex items-center justify-between p-3 bg-background border rounded-lg"
          >
            <div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-muted-foreground">{item.info}</p>
              {item.progress !== undefined && (
                <Progress value={item.progress} className="w-full mt-2 h-2" />
              )}
            </div>
            <Button onClick={() => onSelect(item.id, item.type)}>
              Đặt lịch
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default function ServiceSelection({ onSelect }: ServiceSelectionProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { data: services, isLoading: isLoadingServices } = useServices();
  const { data: treatments, isLoading: isLoadingTreatments } =
    useTreatmentPlans();

  if (isLoadingServices || isLoadingTreatments) {
    return <FullPageLoader />;
  }

  // Hàm xử lý khi người dùng chọn MUA một liệu trình mới
  const handleSelectNewTreatment = (id: string) => {
    // Chuyển hướng đến trang chi tiết để mua
    router.push(`/treatment-plans/${id}`);
  };

  return (
    <div className="space-y-8">
      {/* Phần mới: Chỉ hiển thị khi đã đăng nhập */}
      {user && <PurchasedItems onSelect={onSelect} />}

      {/* Phần cũ: Giữ nguyên cho khách mới hoặc mua thêm */}
      <Card>
        <CardHeader>
          <CardTitle>
            {user
              ? "Mua dịch vụ hoặc liệu trình mới"
              : "Bước 1: Chọn dịch vụ hoặc liệu trình"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Dịch vụ lẻ</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {services?.map((service) => (
                <Button
                  key={service.id}
                  variant="outline"
                  className="h-auto py-4"
                  onClick={() => onSelect(service.id, "service")}
                >
                  {service.name}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">Liệu trình trọn gói</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {treatments?.map((treatment) => (
                <Button
                  key={treatment.id}
                  variant="outline"
                  className="h-auto py-4"
                  // THAY ĐỔI: Phân biệt giữa việc đặt lịch cho liệu trình đã mua và mua mới
                  // Nếu là khách vãng lai (chưa login) hoặc họ bấm vào khu vực "mua mới",
                  // thì sẽ chuyển hướng đến trang chi tiết.
                  onClick={() =>
                    user
                      ? handleSelectNewTreatment(treatment.id)
                      : handleSelectNewTreatment(treatment.id)
                  }
                >
                  {treatment.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
