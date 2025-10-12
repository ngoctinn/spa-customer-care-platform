"use client";

import { useParams } from "next/navigation";
import { AdminDetailPageLayout } from "@/components/layout/admin/AdminDetailPageLayout";
import { FullPageLoader } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2, Phone, Mail, User, MapPin } from "lucide-react";
import { useSupplierById } from "@/features/inventory/hooks/useSuppliers";
import { Supplier } from "@/features/inventory/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import React from "react";

// --- Sub-components ---
const SupplierInfoCard = ({ supplier }: { supplier: Supplier }) => (
  <Card>
    <CardHeader className="flex-row justify-between items-center">
      <CardTitle>Thông tin liên hệ</CardTitle>
      <Button variant="outline" size="sm">
        <Edit className="mr-2 h-4 w-4" />
        Sửa
      </Button>
    </CardHeader>
    <CardContent className="space-y-4 text-sm">
      <div className="flex items-center">
        <User className="mr-4 h-5 w-5 text-muted-foreground" />{" "}
        <span>{supplier.contact_person}</span>
      </div>
      <div className="flex items-center">
        <Phone className="mr-4 h-5 w-5 text-muted-foreground" />{" "}
        <span>{supplier.phone}</span>
      </div>
      <div className="flex items-center">
        <Mail className="mr-4 h-5 w-5 text-muted-foreground" />{" "}
        <span>{supplier.email || "N/A"}</span>
      </div>
      <div className="flex items-start">
        <MapPin className="mr-4 h-5 w-5 text-muted-foreground flex-shrink-0" />{" "}
        <span>{supplier.address || "N/A"}</span>
      </div>
    </CardContent>
  </Card>
);

const mockImportHistory = [
  { id: "pnk1", date: "2025-09-20", total: 15000000 },
  { id: "pnk2", date: "2025-08-15", total: 22500000 },
];

const ImportHistoryTable = () => (
  <Card>
    <CardHeader>
      <CardTitle>Lịch sử nhập hàng</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã phiếu</TableHead>
            <TableHead>Ngày nhập</TableHead>
            <TableHead className="text-right">Tổng tiền</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockImportHistory.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">
                {item.id.toUpperCase()}
              </TableCell>
              <TableCell>{item.date}</TableCell>
              <TableCell className="text-right">
                {item.total.toLocaleString("vi-VN")}đ
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

// --- Main Page ---
export default function SupplierDetailPage() {
  const params = useParams();
  const supplierId = params.supplierId as string;
  const { data: supplier, isLoading, isError } = useSupplierById(supplierId);

  if (isLoading) {
    return <FullPageLoader text="Đang tải dữ liệu nhà cung cấp..." />;
  }

  if (isError || !supplier) {
    return <div>Không tìm thấy nhà cung cấp.</div>;
  }

  return (
    <AdminDetailPageLayout
      title={supplier.name}
      description="Thông tin chi tiết và lịch sử nhập hàng từ nhà cung cấp."
      actionButtons={
        <Button variant="destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Xóa
        </Button>
      }
      mainContent={<ImportHistoryTable />}
      sideContent={<SupplierInfoCard supplier={supplier} />}
    />
  );
}
