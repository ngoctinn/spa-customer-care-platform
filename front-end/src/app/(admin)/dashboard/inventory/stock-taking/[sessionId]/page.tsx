// src/app/(admin)/dashboard/inventory/stock-taking/[sessionId]/page.tsx
"use client";

import { useParams } from "next/navigation";
import {
  useStockTakeById,
  useStockTakeMutations,
} from "@/features/inventory/hooks/useStockTakes";
import { PageHeader } from "@/components/common/PageHeader";
import { FullPageLoader } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { StockTakeItemList } from "@/features/inventory/components/stock-taking/StockTakeItemList";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { useState } from "react";

export default function StockTakeDetailPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const { data: session, isLoading } = useStockTakeById(sessionId);
  const { completeMutation } = useStockTakeMutations();

  if (isLoading) {
    return <FullPageLoader text="Đang tải dữ liệu phiên kiểm kê..." />;
  }

  if (!session) {
    return <div>Không tìm thấy phiên kiểm kê.</div>;
  }

  const isCompleted = session.status === "completed";

  const handleComplete = () => {
    completeMutation.mutate(sessionId, {
      onSuccess: () => setIsConfirmOpen(false),
    });
  };

  return (
    <>
      <PageHeader
        title={`Phiên kiểm kê: ${session.code}`}
        description={`Tạo bởi ${session.created_by.email} vào ${new Date(
          session.created_at
        ).toLocaleString("vi-VN")}`}
        actionNode={
          !isCompleted && (
            <Button
              onClick={() => setIsConfirmOpen(true)}
              disabled={completeMutation.isPending}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Hoàn tất & Điều chỉnh
            </Button>
          )
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Đối chiếu tồn kho</CardTitle>
          <CardDescription>
            {isCompleted
              ? "Phiên kiểm kê đã hoàn tất. Tồn kho đã được điều chỉnh."
              : "Nhập số lượng thực tế đếm được vào cột 'Thực tế'. Hệ thống sẽ tự động tính toán chênh lệch."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StockTakeItemList
            items={session.items || []}
            sessionId={sessionId}
            isCompleted={isCompleted}
          />
        </CardContent>
      </Card>

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Xác nhận Hoàn tất Kiểm kê"
        description="Hành động này sẽ tự động tạo các phiếu điều chỉnh cho tất cả sản phẩm có chênh lệch và cập nhật lại tồn kho. Bạn không thể hoàn tác."
        onConfirm={handleComplete}
        confirmText={completeMutation.isPending ? "Đang xử lý..." : "Xác nhận"}
        isDestructive
      />
    </>
  );
}
