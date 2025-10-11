// src/features/inventory/components/warehouse-slips/WarehouseSlipDetail.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WarehouseSlip } from "../../types";
import { Badge } from "@/components/ui/badge";

interface WarehouseSlipDetailProps {
  slip: WarehouseSlip | null;
  isOpen: boolean;
  onClose: () => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value
  );

export default function WarehouseSlipDetail({
  slip,
  isOpen,
  onClose,
}: WarehouseSlipDetailProps) {
  if (!slip) return null;

  const isImport = slip.type === "IMPORT";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chi tiết phiếu: {slip.code}</DialogTitle>
          <DialogDescription>
            <Badge variant={isImport ? "default" : "secondary"}>
              {isImport ? "Phiếu Nhập Kho" : "Phiếu Xuất Kho"}
            </Badge>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Ngày tạo</p>
              <p className="font-medium">
                {new Date(slip.created_at).toLocaleString("vi-VN")}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Người tạo</p>
              <p className="font-medium">{slip.user.full_name}</p>
            </div>
            {isImport && slip.supplier && (
              <div>
                <p className="text-muted-foreground">Nhà cung cấp</p>
                <p className="font-medium">{slip.supplier.name}</p>
              </div>
            )}
            {slip.notes && (
              <div className="col-span-2">
                <p className="text-muted-foreground">Ghi chú</p>
                <p className="font-medium">{slip.notes}</p>
              </div>
            )}
          </div>
          <Separator />
          <h4 className="font-semibold">Chi tiết sản phẩm</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sản phẩm</TableHead>
                <TableHead className="text-right">Số lượng</TableHead>
                {isImport && (
                  <TableHead className="text-right">Đơn giá</TableHead>
                )}
                {isImport && (
                  <TableHead className="text-right">Thành tiền</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {slip.items.map((item) => (
                <TableRow key={item.product_id}>
                  <TableCell>{item.product_name}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  {isImport && (
                    <TableCell className="text-right">
                      {formatCurrency(item.unit_price || 0)}
                    </TableCell>
                  )}
                  {isImport && (
                    <TableCell className="text-right">
                      {formatCurrency((item.unit_price || 0) * item.quantity)}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {isImport && (
            <div className="flex justify-end pt-4 font-bold text-lg">
              <span>Tổng cộng:</span>
              <span className="ml-4">
                {formatCurrency(slip.total_amount || 0)}
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
