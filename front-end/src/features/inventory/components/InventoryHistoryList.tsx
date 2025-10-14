// src/features/inventory/components/InventoryHistoryList.tsx
"use client";

import { useInventoryHistory } from "@/features/inventory/hooks/useInventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { useStaff } from "@/features/staff/hooks/useStaff";

interface InventoryHistoryListProps {
  productId: string;
}

export default function InventoryHistoryList({
  productId,
}: InventoryHistoryListProps) {
  const { data: history = [], isLoading: isLoadingHistory } =
    useInventoryHistory(productId);
  const { data: staffList = [], isLoading: isLoadingStaff } = useStaff();
  const staffNameMap = useMemo(() => {
    return new Map(staffList.map((staff) => [staff.user.id, staff.full_name]));
  }, [staffList]);
  const isLoading = isLoadingHistory || isLoadingStaff;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lịch sử Tồn kho</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : history.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Chưa có lịch sử giao dịch.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thời gian</TableHead>
                <TableHead>Người thực hiện</TableHead>
                <TableHead className="text-center">Thay đổi</TableHead>
                <TableHead className="text-center">Tồn kho sau đó</TableHead>
                <TableHead>Ghi chú</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    {new Date(tx.created_at).toLocaleString("vi-VN")}
                  </TableCell>
                  <TableCell>
                    {staffNameMap.get(tx.created_by.id) || tx.created_by.email}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      className={cn(
                        tx.quantity_change > 0
                          ? "bg-success/10 text-success"
                          : "bg-destructive/10 text-destructive"
                      )}
                    >
                      {tx.quantity_change > 0
                        ? `+${tx.quantity_change}`
                        : tx.quantity_change}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {tx.new_stock_level}
                  </TableCell>
                  <TableCell>{tx.notes || "N/A"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
