"use client";

import { useParams } from "next/navigation";
import { AdminDetailPageLayout } from "@/components/layout/admin/AdminDetailPageLayout";
import { FullPageLoader } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Edit,
  Trash2,
  Phone,
  Mail,
  User,
  MapPin,
  DollarSign,
  Package,
  Calendar,
} from "lucide-react";
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
import React from "react";
import { StatCard } from "@/features/dashboard/components/StatCard";
import { useQuery } from "@tanstack/react-query";
import { getWarehouseSlips } from "@/features/inventory/apis/warehouse-slip.api";
import { FormDialog } from "@/components/common/FormDialog";
import SupplierForm from "@/features/inventory/components/suppliers/SupplierForm";
import { useSupplierManagement } from "@/features/inventory/hooks/useSupplierManagement";
import { SupplierFormValues } from "@/features/inventory/schemas/supplier.schema";
import { useWarehouseSlips } from "@/features/inventory/hooks/useWarehouseSlips";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";

// --- Sub-components ---
const SupplierInfoCard = ({
  supplier,
  onEdit,
}: {
  supplier: Supplier;
  onEdit: () => void;
}) => (
  <Card>
    <CardHeader className="flex-row justify-between items-center">
      <CardTitle>Thông tin liên hệ</CardTitle>
      <Button variant="outline" size="sm" onClick={onEdit}>
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

const ImportHistoryTable = ({ supplierId }: { supplierId: string }) => {
  const { data: slips = [], isLoading } = useWarehouseSlips({
    supplierId: supplierId,
    type: "IMPORT",
  });

  if (isLoading) return <p>Đang tải lịch sử nhập hàng...</p>;

  return (
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
            {slips.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  Chưa có lịch sử nhập hàng.
                </TableCell>
              </TableRow>
            ) : (
              slips.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.code}</TableCell>
                  <TableCell>
                    {new Date(item.created_at).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell className="text-right">
                    {(item.total_amount || 0).toLocaleString("vi-VN")}đ
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

// --- Main Page ---
export default function SupplierDetailPage() {
  const params = useParams();
  const supplierId = params.supplierId as string;
  const { data: supplier, isLoading, isError } = useSupplierById(supplierId);
  const {
    form,
    handleFormSubmit,
    isSubmitting,
    isFormOpen,
    itemToDelete,
    handleOpenEditForm,
    handleCloseForm,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleConfirmDelete,
  } = useSupplierManagement();
  const { data: slips } = useWarehouseSlips();

  const handleEditClick = () => {
    if (supplier) {
      handleOpenEditForm(supplier);
    }
  };

  const supplierSlips =
    slips?.filter(
      (s) => s.type === "IMPORT" && s.supplier?.id === supplierId
    ) || [];
  const totalValue = supplierSlips.reduce(
    (acc, s) => acc + (s.total_amount || 0),
    0
  );
  const uniqueProducts = new Set(
    supplierSlips.flatMap((s) => s.items.map((i) => i.product_id))
  ).size;
  const lastImport =
    supplierSlips.length > 0
      ? new Date(supplierSlips[0].created_at).toLocaleDateString("vi-VN")
      : "Chưa có";

  if (isLoading) {
    return <FullPageLoader text="Đang tải dữ liệu nhà cung cấp..." />;
  }

  if (isError || !supplier) {
    return <div>Không tìm thấy nhà cung cấp.</div>;
  }

  const mainContent = (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Tổng giá trị đã nhập"
          value={`${totalValue.toLocaleString("vi-VN")}đ`}
          icon={DollarSign}
          description="Dựa trên các phiếu nhập kho"
        />
        <StatCard
          title="Sản phẩm cung cấp"
          value={uniqueProducts.toString()}
          icon={Package}
          description="Số lượng sản phẩm duy nhất"
        />
        <StatCard
          title="Lần nhập gần nhất"
          value={lastImport}
          icon={Calendar}
          description="Ngày nhập hàng cuối cùng"
        />
      </div>
      <ImportHistoryTable supplierId={supplierId} />
    </>
  );

  const sideContent = (
    <SupplierInfoCard supplier={supplier} onEdit={handleEditClick} />
  );

  return (
    <>
      <AdminDetailPageLayout
        title={supplier.name}
        description="Thông tin chi tiết và lịch sử nhập hàng từ nhà cung cấp."
        actionButtons={
          <Button
            variant="destructive"
            onClick={() => handleOpenDeleteDialog(supplier)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa
          </Button>
        }
        mainContent={mainContent}
        sideContent={sideContent}
      />
      <FormDialog<SupplierFormValues>
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={`Chỉnh sửa nhà cung cấp: ${supplier.name}`}
        form={form}
        onFormSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      >
        <SupplierForm />
      </FormDialog>

      <ConfirmationModal
        isOpen={!!itemToDelete}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title={`Xác nhận xóa "${itemToDelete?.name}"`}
        description="Bạn có chắc chắn muốn xóa nhà cung cấp này không? Hành động này không thể hoàn tác."
        isDestructive
        confirmText="Xóa"
      />
    </>
  );
}
