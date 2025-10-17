"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { getInvoicesByCustomerId } from "@/features/checkout/api/invoice.api";
import { Invoice } from "@/features/checkout/types";

interface InvoiceSearchStepProps {
  onInvoiceSelect: (invoice: Invoice) => void;
}

export default function InvoiceSearchStep({
  onInvoiceSelect,
}: InvoiceSearchStepProps) {
  const [searchQuery, setSearchQuery] = useState("");
  // Tạm thời chỉ hỗ trợ tìm theo ID khách hàng, có thể mở rộng sau
  const {
    data: invoices = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["invoices", "search", searchQuery],
    queryFn: () => getInvoicesByCustomerId(searchQuery),
    enabled: searchQuery.length > 5, // Tối ưu: chỉ tìm khi query đủ dài
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bước 1: Tìm Hóa Đơn Gốc</CardTitle>
        <CardDescription>
          Nhập mã hóa đơn, tên hoặc SĐT khách hàng để tìm kiếm.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="mt-4 border rounded-md h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Spinner />
            </div>
          ) : (
            <Table>
              <TableBody>
                {invoices.length > 0 ? (
                  invoices.map((invoice) => (
                    <TableRow
                      key={invoice.id}
                      onClick={() => onInvoiceSelect(invoice)}
                      className="cursor-pointer"
                    >
                      <TableCell>
                        <div className="font-medium">
                          #{invoice.id.substring(0, 8).toUpperCase()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(invoice.created_at).toLocaleString("vi-VN")}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {invoice.total_amount.toLocaleString("vi-VN")}đ
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell className="text-center h-96">
                      Không tìm thấy hóa đơn.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
