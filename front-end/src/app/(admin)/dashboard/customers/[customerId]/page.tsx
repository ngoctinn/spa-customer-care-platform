"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { AdminDetailPageLayout } from "@/components/layout/admin/AdminDetailPageLayout";
import { FullPageLoader } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Edit,
  Trash2,
  Phone,
  Mail,
  StickyNote,
  Award,
  DollarSign,
  CalendarDays,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FormDialog } from "@/components/common/FormDialog";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { StatCard } from "@/features/dashboard/components/StatCard";

import { useCustomerById } from "@/features/customer/hooks/useCustomers";
import { useAppointments } from "@/features/appointment/hooks/useAppointments";
import { useInvoices } from "@/features/checkout/hooks/useInvoices";
import {
  useCustomerManagement,
  CustomerFormValues,
} from "@/features/customer/hooks/useCustomerManagement";
import CustomerFormFields from "@/features/customer/components/CustomerFormFields";
import { FullCustomerProfile } from "@/features/customer/types";
import apiClient from "@/lib/apiClient";

// --- Giả định các kiểu dữ liệu và API mới ---
interface DebtHistoryTransaction {
  id: string;
  type: "accrual" | "settlement";
  amount: number;
  related_invoice_id?: string;
  new_balance: number;
  created_at: string;
}

const getDebtHistory = async (
  customerId: string
): Promise<DebtHistoryTransaction[]> => {
  return apiClient(`/customers/${customerId}/debt-history`);
};

// --- Components for the Detail Page ---

const CustomerInfoCard = ({
  customer,
  onEdit,
}: {
  customer: FullCustomerProfile;
  onEdit: () => void;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle>Thông tin cá nhân</CardTitle>
      <Button variant="outline" size="sm" onClick={onEdit}>
        <Edit className="mr-2 h-4 w-4" />
        Chỉnh sửa
      </Button>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex items-center">
        <Mail className="mr-4 h-5 w-5 text-muted-foreground" />
        <span>{customer.email}</span>
      </div>
      <div className="flex items-center">
        <Phone className="mr-4 h-5 w-5 text-muted-foreground" />
        <span>{customer.phone_number || "Chưa cập nhật"}</span>
      </div>
      <Separator />
      <div className="space-y-2">
        <div className="flex items-start">
          <StickyNote className="mr-4 h-5 w-5 text-muted-foreground flex-shrink-0" />
          <div>
            <h4 className="font-semibold">Ghi chú nội bộ</h4>
            <p className="text-muted-foreground text-sm italic">
              {customer.note || "Không có ghi chú nào."}
            </p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const CustomerLoyaltyCard = ({
  customer,
}: {
  customer: FullCustomerProfile;
}) => {
  const currentTier = customer.loyalty_tier;
  const currentPoints = customer.loyalty_points || 0;
  const nextTierPoints = (currentTier?.point_goal || 0) * 2 || 5000;
  const progress = Math.min((currentPoints / nextTierPoints) * 100, 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-warning" />
          Thành viên
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="font-bold text-2xl">
            {currentPoints.toLocaleString("vi-VN")} điểm
          </span>
          {currentTier && (
            <Badge
              style={{ backgroundColor: currentTier.color_hex, color: "white" }}
            >
              {currentTier.name}
            </Badge>
          )}
        </div>
        <div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Còn{" "}
            {Math.max(0, nextTierPoints - currentPoints).toLocaleString(
              "vi-VN"
            )}{" "}
            điểm để lên hạng.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

const CustomerStats = ({
  totalSpent,
  completedAppointments,
  debtAmount,
}: {
  totalSpent: number;
  completedAppointments: number;
  debtAmount: number;
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <StatCard
      title="Tổng chi tiêu"
      value={`${totalSpent.toLocaleString("vi-VN")}đ`}
      icon={DollarSign}
      description="Dựa trên các hóa đơn đã trả"
    />
    <StatCard
      title="Số lần đến"
      value={completedAppointments.toString()}
      icon={CalendarDays}
      description="Lịch hẹn đã hoàn thành"
    />
    <StatCard
      title="Công nợ hiện tại"
      value={`${debtAmount.toLocaleString("vi-VN")}đ`}
      icon={AlertCircle}
      description="Tổng số tiền chưa thanh toán"
      iconColor={debtAmount > 0 ? "text-destructive" : "text-success"}
    />
  </div>
);

// ++ COMPONENT MỚI: LỊCH SỬ CÔNG NỢ ++
const DebtHistoryList = ({ customerId }: { customerId: string }) => {
  const { data: history = [], isLoading } = useQuery({
    queryKey: ["debtHistory", customerId],
    queryFn: () => getDebtHistory(customerId),
  });

  if (isLoading) return <p>Đang tải lịch sử công nợ...</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lịch sử Công nợ</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ngày</TableHead>
              <TableHead>Loại Giao dịch</TableHead>
              <TableHead>Số tiền</TableHead>
              <TableHead className="text-right">Số dư nợ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  Không có lịch sử công nợ.
                </TableCell>
              </TableRow>
            ) : (
              history.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    {new Date(tx.created_at).toLocaleString("vi-VN")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        tx.type === "accrual" ? "destructive" : "default"
                      }
                    >
                      {tx.type === "accrual" ? "Ghi nợ" : "Thanh toán"}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={`font-medium ${
                      tx.type === "accrual"
                        ? "text-destructive"
                        : "text-success"
                    }`}
                  >
                    {tx.type === "accrual" ? "+" : "-"}{" "}
                    {tx.amount.toLocaleString("vi-VN")}đ
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {tx.new_balance.toLocaleString("vi-VN")}đ
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

const RecentAppointmentsList = ({ customerId }: { customerId: string }) => {
  const { data: allAppointments = [], isLoading } = useAppointments();
  const appointments = allAppointments
    .filter((apt) => apt.customer_id === customerId)
    .slice(0, 5);
  if (isLoading) return <p>Đang tải lịch hẹn...</p>;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lịch hẹn gần đây</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dịch vụ</TableHead>
              <TableHead>Ngày</TableHead>
              <TableHead>Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center h-24">
                  Chưa có lịch hẹn.
                </TableCell>
              </TableRow>
            ) : (
              appointments.map((apt) => (
                <TableRow key={apt.id}>
                  <TableCell className="font-medium">
                    {apt.service_id}
                  </TableCell>
                  <TableCell>
                    {new Date(apt.start_time).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        apt.status === "upcoming" ? "default" : "secondary"
                      }
                    >
                      {apt.status}
                    </Badge>
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

const RecentOrdersList = ({ customerId }: { customerId: string }) => {
  const { data: invoices = [], isLoading } = useInvoices(customerId);

  if (isLoading) return <p>Đang tải đơn hàng...</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đơn hàng gần đây</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã đơn</TableHead>
              <TableHead>Ngày</TableHead>
              <TableHead>Tổng tiền</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center h-24">
                  Chưa có đơn hàng.
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    {order.id.substring(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell>
                    {new Date(order.created_at).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell>
                    {order.total_amount.toLocaleString("vi-VN")}đ
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

// --- Main Page Component ---
export default function CustomerDetailPage() {
  const params = useParams();
  const customerId = params.customerId as string;

  const { data: customer, isLoading, isError } = useCustomerById(customerId);
  const { data: allAppointments = [] } = useAppointments();
  const { data: invoices = [] } = useInvoices(customerId);

  const {
    form,
    isFormOpen,
    isSubmitting,
    itemToDelete,
    handleFormSubmit,
    handleOpenEditForm,
    handleCloseForm,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleConfirmDelete,
  } = useCustomerManagement();

  const handleEditClick = () => {
    if (customer) {
      handleOpenEditForm(customer);
    }
  };

  const { totalSpent, completedAppointments } = useMemo(() => {
    const total = invoices.reduce(
      (sum, inv) => sum + (inv.status === "paid" ? inv.total_amount : 0),
      0
    );
    const completed = allAppointments.filter(
      (apt) => apt.customer_id === customerId && apt.status === "completed"
    ).length;
    return { totalSpent: total, completedAppointments: completed };
  }, [invoices, allAppointments, customerId]);

  if (isLoading) {
    return <FullPageLoader text="Đang tải dữ liệu khách hàng..." />;
  }
  if (isError || !customer) {
    return (
      <div>
        <h2>Không tìm thấy khách hàng</h2>
        <Link href="/dashboard/customers">
          <Button variant="outline">Quay lại</Button>
        </Link>
      </div>
    );
  }

  const mainContent = (
    <>
      <CustomerStats
        totalSpent={totalSpent}
        completedAppointments={completedAppointments}
        debtAmount={customer.debt_amount || 0}
      />
      <DebtHistoryList customerId={customerId} />
      <RecentAppointmentsList customerId={customerId} />
      <RecentOrdersList customerId={customerId} />
    </>
  );

  const sideContent = (
    <>
      <CustomerInfoCard customer={customer} onEdit={handleEditClick} />
      <CustomerLoyaltyCard customer={customer} />
    </>
  );

  return (
    <>
      <AdminDetailPageLayout
        title={customer.full_name}
        description={`Chi tiết khách hàng, ID: ${customer.id}`}
        actionButtons={
          <Button
            variant="destructive"
            onClick={() => handleOpenDeleteDialog(customer)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Vô hiệu hóa
          </Button>
        }
        mainContent={mainContent}
        sideContent={sideContent}
      />
      <FormDialog<CustomerFormValues>
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={`Chỉnh sửa: ${customer.full_name}`}
        form={form}
        onFormSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      >
        <CustomerFormFields />
      </FormDialog>
      <ConfirmationModal
        isOpen={!!itemToDelete}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title={`Xác nhận vô hiệu hóa "${itemToDelete?.full_name}"`}
        description="Bạn có chắc chắn muốn vô hiệu hóa khách hàng này không? Hành động này có thể được hoàn tác."
        isDestructive
        confirmText="Vô hiệu hóa"
      />
    </>
  );
}
