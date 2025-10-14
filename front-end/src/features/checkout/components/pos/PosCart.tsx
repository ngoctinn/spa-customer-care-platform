// src/features/checkout/components/pos/PosCart.tsx
"use client";

import { usePosStore } from "@/features/checkout/stores/pos-store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, CalendarCheck } from "lucide-react";

export function PosCart() {
  const { items, updateQuantity, removeItem } = usePosStore();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sản phẩm/Dịch vụ</TableHead>
            <TableHead className="w-[80px]">SL</TableHead>
            <TableHead className="w-[120px]" align="right">
              Đơn giá
            </TableHead>
            <TableHead className="w-[120px]" align="right">
              Thành tiền
            </TableHead>
            <TableHead className="w-[40px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                Chưa có sản phẩm nào.
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {item.appointment_id && (
                      <CalendarCheck className="h-4 w-4 text-primary" />
                    )}
                    {item.name}
                  </div>
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    className="h-8 w-16"
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.id, parseInt(e.target.value) || 1)
                    }
                    min={1}
                    disabled={!!item.appointment_id} // Không cho sửa SL của dịch vụ từ lịch hẹn
                  />
                </TableCell>
                <TableCell align="right">
                  {item.price.toLocaleString("vi-VN")}đ
                </TableCell>
                <TableCell align="right">
                  {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                </TableCell>
                <TableCell>
                  {!item.appointment_id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
