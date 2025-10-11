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

export default function LowStockProductsTable() {
  const { data: lowStockProducts = [], isLoading } = useQuery({
    queryKey: ["lowStockProducts"],
    queryFn: getLowStockProducts,
  });

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
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Spinner />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sản phẩm</TableHead>
                <TableHead className="text-center">Tồn kho</TableHead>
                <TableHead className="text-center">Ngưỡng</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowStockProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    Không có sản phẩm nào sắp hết hàng.
                  </TableCell>
                </TableRow>
              )}
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
        )}
      </CardContent>
    </Card>
  );
}
