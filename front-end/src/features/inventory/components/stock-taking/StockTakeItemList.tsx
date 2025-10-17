// src/features/inventory/components/stock-taking/StockTakeItemList.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { StockTakeItem } from "@/features/inventory/types";
import { useStockTakeMutations } from "@/features/inventory/hooks/useStockTakes";

interface StockTakeItemListProps {
  items: StockTakeItem[];
  sessionId: string;
  isCompleted: boolean;
}

export function StockTakeItemList({
  items,
  sessionId,
  isCompleted,
}: StockTakeItemListProps) {
  const [showOnlyVariance, setShowOnlyVariance] = useState(true);
  const [localCounts, setLocalCounts] = useState<Record<string, number>>({});

  const { updateItemsMutation } = useStockTakeMutations();

  // Debounce logic using useEffect and setTimeout
  useEffect(() => {
    const handler = setTimeout(() => {
      const changes = Object.entries(localCounts).map(
        ([product_id, actual_quantity]) => ({
          product_id,
          actual_quantity: Number(actual_quantity), // Ensure it's a number
        })
      );

      if (changes.length > 0) {
        updateItemsMutation.mutate({ sessionId, items: changes });
        setLocalCounts({}); // Reset local state after sending
      }
    }, 1000); // 1-second debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [localCounts, sessionId, updateItemsMutation]);

  const handleCountChange = (productId: string, count: string) => {
    const newCount = parseInt(count, 10);
    if (!isNaN(newCount) && newCount >= 0) {
      setLocalCounts((prev) => ({ ...prev, [productId]: newCount }));
    } else if (count === "") {
      // Allow clearing the input
      setLocalCounts((prev) => ({ ...prev, [productId]: 0 }));
    }
  };

  const filteredItems = useMemo(() => {
    if (!showOnlyVariance) return items;

    // When showing variance, also include items that have local changes but not yet saved
    return items.filter(
      (item) =>
        item.variance !== 0 || localCounts.hasOwnProperty(item.product_id)
    );
  }, [items, showOnlyVariance, localCounts]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input placeholder="Tìm kiếm sản phẩm..." className="max-w-sm" />
        <div className="flex items-center space-x-2">
          <Switch
            id="show-variance-only"
            checked={showOnlyVariance}
            onCheckedChange={setShowOnlyVariance}
          />
          <Label htmlFor="show-variance-only">Chỉ hiện chênh lệch</Label>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sản phẩm</TableHead>
              <TableHead className="w-40 text-center">
                Tồn kho Hệ thống
              </TableHead>
              <TableHead className="w-40 text-center">
                Tồn kho Thực tế
              </TableHead>
              <TableHead className="w-40 text-center">Chênh lệch</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => {
              // Determine the current value to display in the input
              const displayValue =
                localCounts[item.product_id] !== undefined
                  ? localCounts[item.product_id]
                  : item.actual_quantity ?? "";

              // Calculate variance based on the most current data (local or from props)
              const currentActual =
                localCounts[item.product_id] ?? item.actual_quantity ?? 0;
              const variance = currentActual - item.system_quantity;

              return (
                <TableRow key={item.product_id}>
                  <TableCell className="font-medium">
                    {item.product_name}
                  </TableCell>
                  <TableCell className="text-center">
                    {item.system_quantity}
                  </TableCell>
                  <TableCell className="text-center">
                    <Input
                      type="number"
                      className="mx-auto max-w-[100px] text-center"
                      value={displayValue}
                      onChange={(e) =>
                        handleCountChange(item.product_id, e.target.value)
                      }
                      disabled={isCompleted}
                      min={0}
                    />
                  </TableCell>
                  <TableCell
                    className={`text-center font-bold ${
                      variance > 0
                        ? "text-success"
                        : variance < 0
                        ? "text-destructive"
                        : ""
                    }`}
                  >
                    {variance > 0 ? `+${variance}` : variance}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
