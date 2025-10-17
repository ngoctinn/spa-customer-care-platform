// src/app/(public)/account/loyalty-history/page.tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FullPageLoader } from "@/components/ui/spinner";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Giả định kiểu dữ liệu cho giao dịch điểm thưởng
interface LoyaltyTransaction {
  id: string;
  points_change: number;
  type: "accrual" | "redemption" | "correction";
  reason: string;
  created_at: string;
}

// Giả định API endpoint
const fetchLoyaltyHistory = async (): Promise<LoyaltyTransaction[]> => {
  return apiClient<LoyaltyTransaction[]>("/customers/me/loyalty-history");
};

export default function LoyaltyHistoryPage() {
  const {
    data: transactions = [],
    isLoading,
    isError,
  } = useQuery<LoyaltyTransaction[]>({
    queryKey: ["loyaltyHistory"],
    queryFn: fetchLoyaltyHistory,
  });

  const sortedTransactions = transactions.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lịch sử điểm thưởng</CardTitle>
        <CardDescription>
          Theo dõi các giao dịch tích lũy và sử dụng điểm của bạn.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <FullPageLoader text="Đang tải lịch sử điểm..." />
          </div>
        ) : isError ? (
          <p className="text-destructive text-center">Không thể tải dữ liệu.</p>
        ) : sortedTransactions.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Bạn chưa có giao dịch điểm nào.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày giao dịch</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead className="text-right">Thay đổi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTransactions.map((tx) => {
                const isAccrual = tx.points_change > 0;
                return (
                  <TableRow key={tx.id}>
                    <TableCell>
                      {new Date(tx.created_at).toLocaleString("vi-VN")}
                    </TableCell>
                    <TableCell>{tx.reason}</TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-semibold flex items-center justify-end gap-1",
                        isAccrual ? "text-success" : "text-destructive"
                      )}
                    >
                      {isAccrual ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                      {isAccrual ? "+" : ""}
                      {tx.points_change.toLocaleString("vi-VN")}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
