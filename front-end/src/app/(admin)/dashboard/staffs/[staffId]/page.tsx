// src/app/(admin)/dashboard/staffs/[staffId]/page.tsx
"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Edit, Trash2, Phone, Mail, Shield, CalendarClock } from "lucide-react";

import { AdminDetailPageLayout } from "@/components/layout/admin/AdminDetailPageLayout";
import { FullPageLoader } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FormDialog } from "@/components/common/FormDialog";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";

import { useStaffById } from "@/features/staff/hooks/useStaff";
import { useStaffManagement } from "@/features/staff/hooks/useStaffManagement";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateStaffServices,
  updateStaffStatus,
} from "@/features/staff/api/staff.api";
import {
  staffServicesSchema,
  StaffServicesFormValues,
} from "@/features/staff/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import StaffServicesForm from "@/features/staff/components/StaffServicesForm";
import StaffForm from "@/features/staff/components/StaffForm";
import { FullStaffProfile } from "@/features/staff/types";

// Card thông tin cá nhân
const StaffInfoCard = ({
  staff,
  onEdit,
}: {
  staff: FullStaffProfile;
  onEdit: () => void;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle>Thông tin cá nhân</CardTitle>
      <Button variant="outline" size="sm" onClick={onEdit}>
        <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
      </Button>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex items-center">
        <Mail className="mr-4 h-5 w-5 text-muted-foreground" />
        <span>{staff.email}</span>
      </div>
      <div className="flex items-center">
        <Phone className="mr-4 h-5 w-5 text-muted-foreground" />
        <span>{staff.phone || "Chưa cập nhật"}</span>
      </div>
      <div className="flex items-center">
        <Shield className="mr-4 h-5 w-5 text-muted-foreground" />
        <div className="flex flex-wrap gap-1">
          {staff.roles?.map((role) => (
            <Badge key={role.id}>{role.name}</Badge>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

const StaffActionsCard = ({ staffId }: { staffId: string }) => (
  <Card>
    <CardHeader>
      <CardTitle>Quản lý & Tác vụ</CardTitle>
      <CardDescription>
        Các hành động liên quan đến nhân viên này.
      </CardDescription>
    </CardHeader>
    <CardContent className="flex flex-col gap-2">
      <Button variant="outline" asChild>
        <Link href={`/dashboard/staffs/${staffId}/schedule`}>
          <CalendarClock className="mr-2 h-4 w-4" />
          Quản lý lịch làm việc
        </Link>
      </Button>
      <Button variant="outline" disabled>
        Phân công dịch vụ
      </Button>
    </CardContent>
  </Card>
);

// Card Kỹ năng/Dịch vụ
const StaffServicesCard = ({
  staff,
  onEdit,
}: {
  staff: FullStaffProfile;
  onEdit: () => void;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle>Kỹ năng & Dịch vụ</CardTitle>
      <Button variant="outline" size="sm" onClick={onEdit}>
        <Edit className="mr-2 h-4 w-4" /> Thay đổi
      </Button>
    </CardHeader>
    <CardContent>
      {/* Logic hiển thị danh sách dịch vụ hiện tại */}
      <p className="text-sm text-muted-foreground">
        Các dịch vụ nhân viên này có thể thực hiện.
      </p>
    </CardContent>
  </Card>
);

// --- Main Page Component ---
export default function StaffDetailPage() {
  const params = useParams();
  const router = useRouter();
  const staffId = params.staffId as string;
  const queryClient = useQueryClient();

  // Hooks để lấy dữ liệu và quản lý state form/dialog
  const { data: staff, isLoading, isError } = useStaffById(staffId);
  const {
    form: profileForm,
    isFormOpen,
    isSubmitting,
    itemToDelete,
    handleOpenEditForm,
    handleCloseForm,
    handleFormSubmit,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
  } = useStaffManagement();

  const [isServicesFormOpen, setIsServicesFormOpen] = React.useState(false);

  // Form và mutation cho việc cập nhật dịch vụ
  const servicesForm = useForm<StaffServicesFormValues>({
    resolver: zodResolver(staffServicesSchema),
  });

  const { mutate: updateServices, isPending: isUpdatingServices } = useMutation(
    {
      mutationFn: (data: StaffServicesFormValues) =>
        updateStaffServices(staffId, data),
      onSuccess: () => {
        toast.success("Cập nhật kỹ năng nhân viên thành công!");
        queryClient.invalidateQueries({ queryKey: ["staff", staffId] });
        setIsServicesFormOpen(false);
      },
      onError: (err) =>
        toast.error("Cập nhật thất bại", { description: err.message }),
    }
  );

  // Mutation cho việc thay đổi trạng thái
  const { mutate: changeStatus, isPending: isChangingStatus } = useMutation({
    mutationFn: (statusData: {
      employment_status: string;
      is_active: boolean;
    }) => updateStaffStatus(staffId, statusData),
    onSuccess: (_, variables) => {
      // ++ CẬP NHẬT LOGIC onSuccess ++
      toast.success("Đã vô hiệu hóa tài khoản nhân viên.");
      queryClient.invalidateQueries({ queryKey: ["staff", staffId] });
      queryClient.invalidateQueries({ queryKey: ["staffList"] });
      handleCloseDeleteDialog();

      // Tự động chuyển hướng đến trang phân công lại lịch hẹn
      router.push(`/dashboard/staffs/${staffId}/reassign`);
    },
    onError: (err) =>
      toast.error("Cập nhật thất bại", { description: err.message }),
  });

  // Mở form sửa dịch vụ và điền dữ liệu
  const handleOpenServicesForm = () => {
    const currentServiceIds = staff?.staff_profile.service_ids || [];
    servicesForm.reset({ service_ids: currentServiceIds });
    setIsServicesFormOpen(true);
  };

  // Xác nhận vô hiệu hóa
  const handleConfirmDeactivate = () => {
    changeStatus({ employment_status: "Đã nghỉ việc", is_active: false });
  };

  if (isLoading) {
    return <FullPageLoader text="Đang tải dữ liệu nhân viên..." />;
  }

  if (isError || !staff) {
    return (
      <div>
        <h2>Không tìm thấy nhân viên</h2>
      </div>
    );
  }

  // -- Render Layout --
  const mainContent = (
    <>
      <StaffServicesCard staff={staff} onEdit={handleOpenServicesForm} />
      {/* Audit Log Card */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử thay đổi (Sắp ra mắt)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Các thay đổi quan trọng sẽ được ghi lại ở đây.
          </p>
        </CardContent>
      </Card>
    </>
  );

  const sideContent = (
    <>
      <StaffInfoCard staff={staff} onEdit={() => handleOpenEditForm(staff)} />
      <StaffActionsCard staffId={staff.id} />
    </>
  );

  return (
    <>
      <AdminDetailPageLayout
        title={staff.full_name}
        description={`Chi tiết nhân viên | Trạng thái: ${
          staff.is_active ? "Đang làm việc" : "Đã nghỉ"
        }`}
        actionButtons={
          <Button
            variant="destructive"
            onClick={() => handleOpenDeleteDialog(staff)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Vô hiệu hóa
          </Button>
        }
        mainContent={mainContent}
        sideContent={sideContent}
      />

      {/* Dialog chỉnh sửa thông tin cá nhân */}
      <FormDialog
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title="Chỉnh sửa thông tin nhân viên"
        form={profileForm}
        onFormSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      >
        <StaffForm />
      </FormDialog>

      {/* Dialog chỉnh sửa dịch vụ/kỹ năng */}
      <FormDialog
        isOpen={isServicesFormOpen}
        onClose={() => setIsServicesFormOpen(false)}
        title={`Chỉnh sửa kỹ năng cho ${staff.full_name}`}
        form={servicesForm}
        onFormSubmit={(data) => updateServices(data)}
        isSubmitting={isUpdatingServices}
      >
        <StaffServicesForm />
      </FormDialog>

      {/* Dialog xác nhận vô hiệu hóa */}
      <ConfirmationModal
        isOpen={!!itemToDelete}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDeactivate}
        title={`Xác nhận vô hiệu hóa "${itemToDelete?.full_name}"`}
        description="Hành động này sẽ cập nhật trạng thái làm việc của nhân viên thành 'Đã nghỉ việc' và vô hiệu hóa tài khoản đăng nhập. Bạn có chắc chắn?"
        isDestructive
        confirmText="Xác nhận"
      />
    </>
  );
}
