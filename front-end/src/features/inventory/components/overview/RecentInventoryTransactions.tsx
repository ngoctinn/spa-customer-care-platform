// src/features/inventory/components/overview/RecentInventoryTransactions.tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDownLeft, ArrowUpRight, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getRecentTransactions } from "@/features/inventory/apis/inventory.api";
import { Spinner } from "@/components/ui/spinner";
import { InventoryTransaction } from "../../types";

const typeMap = {
  IMPORT: { icon: ArrowDownLeft, text: "Nhập", className: "text-success" },
  EXPORT: { icon: ArrowUpRight, text: "Xuất", className: "text-destructive" },
  ADJUSTMENT: {
    icon: SlidersHorizontal,
    text: "Điều chỉnh",
    className: "text-warning",
  },
  SALE: { icon: ArrowUpRight, text: "Bán hàng", className: "text-info" },
};

export default function RecentInventoryTransactions() {
  const { data: recentTransactions = [], isLoading } = useQuery({
    queryKey: ["recentTransactions"],
    queryFn: getRecentTransactions,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hoạt động kho gần đây</CardTitle>
        <CardDescription>
          Các hoạt động nhập, xuất, điều chỉnh kho mới nhất.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Spinner />
          </div>
        ) : recentTransactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Chưa có hoạt động nào gần đây.
          </p>
        ) : (
          recentTransactions.map((tx: InventoryTransaction) => {
            const transactionType = typeMap[tx.type];
            const Icon = transactionType.icon;
            return (
              <div key={tx.id} className="flex items-center">
                <Icon
                  className={cn("h-5 w-5 mr-4", transactionType.className)}
                />

                <div className="flex-1">
                  <p className="font-medium">{tx.product_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(tx.created_at).toLocaleString("vi-VN")}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={cn(
                      "font-semibold",
                      tx.quantity_change > 0
                        ? "text-success"
                        : "text-destructive"
                    )}
                  >
                    {tx.quantity_change > 0
                      ? `+${tx.quantity_change}`
                      : tx.quantity_change}
                  </span>
                  <Badge variant="outline" className="ml-2">
                    {transactionType.text}
                  </Badge>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
