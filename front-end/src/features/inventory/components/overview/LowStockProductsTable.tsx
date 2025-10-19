// src/features/inventory/components/overview/LowStockProductsTable.tsx
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getLowStockProducts } from "@/features/inventory/apis/inventory.api";
import { Spinner } from "@/components/ui/spinner";
import { DataStateMessage } from "@/components/common/DataStateMessage"; // Import component

export default function LowStockProductsTable() {
  const {
    data: lowStockProducts = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    // Thêm isError, error
    queryKey: ["lowStockProducts"],
    queryFn: getLowStockProducts,
  });

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-40">
          <Spinner />
        </div>
      );
    }

    if (isError) {
      return (
        <div className="p-4">
          <DataStateMessage
            variant="error"
            message="Không thể tải dữ liệu"
            description={error.message}
          />
        </div>
      );
    }

    if (lowStockProducts.length === 0) {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sản phẩm</TableHead>
              <TableHead className="text-center">Tồn kho</TableHead>
              <TableHead className="text-center">Ngưỡng</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={3} className="h-24 text-center">
                Không có sản phẩm nào sắp hết hàng.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sản phẩm</TableHead>
            <TableHead className="text-center">Tồn kho</TableHead>
            <TableHead className="text-center">Ngưỡng</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lowStockProducts.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <div className="font-medium">{product.name}</div>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="destructive">{product.stock}</Badge>
              </TableCell>
              <TableCell className="text-center">
                {product.low_stock_threshold}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Sản phẩm sắp hết hàng</CardTitle>
          <CardDescription>
            Các sản phẩm có số lượng tồn kho thấp hơn hoặc bằng ngưỡng cảnh báo.
          </CardDescription>
        </div>
        <Button asChild size="sm" className="ml-auto gap-1">
          <Link href="/dashboard/products">
            Xem tất cả
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
}
