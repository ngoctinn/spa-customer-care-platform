// src/features/returns/components/ReturnItemSelectionStep.tsx
"use client";

import Image from "next/image";
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
import { Input } from "@/components/ui/input";
import { Invoice, InvoiceItem } from "@/features/checkout/types";
import { ReturnItem } from "../types";

interface ReturnItemSelectionStepProps {
  invoice: Invoice;
  itemsToReturn: ReturnItem[];
  onItemQuantityChange: (item: InvoiceItem, quantity: number) => void;
}

export default function ReturnItemSelectionStep({
  invoice,
  itemsToReturn,
  onItemQuantityChange,
}: ReturnItemSelectionStepProps) {
  const shippableItems = invoice.items.filter(
    (item) => item.type === "product"
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bước 2: Chọn Sản Phẩm & Số Lượng Trả</CardTitle>
        <CardDescription>
          Nhập số lượng sản phẩm khách hàng muốn trả lại.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sản phẩm</TableHead>
                <TableHead className="text-center">Đã mua</TableHead>
                <TableHead className="w-[120px] text-center">
                  Số lượng trả
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shippableItems.map((item) => {
                const returnedQty =
                  itemsToReturn.find((ri) => ri.invoiceItemId === item.id)
                    ?.quantity || 0;
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-center">
                      {item.quantity}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        max={item.quantity}
                        value={returnedQty}
                        onChange={(e) =>
                          onItemQuantityChange(item, parseInt(e.target.value))
                        }
                        className="text-center"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
