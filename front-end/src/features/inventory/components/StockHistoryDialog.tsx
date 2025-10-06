// src/features/inventory/components/StockHistoryDialog.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { FullPageLoader } from "@/components/ui/spinner";
import { Product } from "@/features/product/types";
import { useStockHistory } from "@/features/inventory/hooks/useInventory";
import {
  StockHistoryLog,
  StockAdjustmentType,
} from "@/features/inventory/types";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface StockHistoryDialogProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const typeLabels: Record<StockAdjustmentType, string> = {
  initial: "Khởi tạo",
  manual_adjustment: "Điều chỉnh thủ công",
  sale: "Bán hàng",
  service_consumption: "Tiêu hao dịch vụ",
  return: "Trả hàng",
  inventory_check: "Kiểm kho",
};

export function StockHistoryDialog({
  product,
  isOpen,
  onClose,
}: StockHistoryDialogProps) {
  const {
    data: history = [],
    isLoading,
    isError,
  } = useStockHistory(product?.id ?? null);

  const renderContent = () => {
    if (isLoading) {
      return <FullPageLoader text="Đang tải lịch sử..." />;
    }
    if (isError) {
      return (
        <p className="text-destructive text-center p-8">
          Không thể tải lịch sử.
        </p>
      );
    }
    if (history.length === 0) {
      return (
        <p className="text-muted-foreground text-center p-8">
          Chưa có lịch sử cho sản phẩm này.
        </p>
      );
    }
    return (
      <ScrollArea className="h-[60vh]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thời gian</TableHead>
              <TableHead>Thay đổi</TableHead>
              <TableHead>Tồn mới</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Người thực hiện</TableHead>
              <TableHead>Ghi chú</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((log: StockHistoryLog) => (
              <TableRow key={log.id}>
                <TableCell>
                  {format(new Date(log.created_at), "dd/MM/yyyy HH:mm", {
                    locale: vi,
                  })}
                </TableCell>
                <TableCell
                  className={`font-bold ${
                    log.quantity_changed > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {log.quantity_changed > 0
                    ? `+${log.quantity_changed}`
                    : log.quantity_changed}
                </TableCell>
                <TableCell className="font-mono">
                  {log.new_stock_level}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {typeLabels[log.type] || "Không xác định"}
                  </Badge>
                </TableCell>
                <TableCell>{log.user_name}</TableCell>
                <TableCell>{log.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Lịch sử tồn kho</DialogTitle>
          <DialogDescription>
            Theo dõi chi tiết các lần thay đổi số lượng của sản phẩm:{" "}
            <span className="font-semibold">{product?.name}</span>.
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
