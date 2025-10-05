"use client";

import {
  useAddStaff,
  useStaff,
  useUpdateStaff,
  useDeleteStaff,
} from "@/features/staff/hooks/useStaff";
import { getStaffColumns } from "@/features/staff/components/columns";
import { DataTable } from "@/components/common/data-table/data-table";
import { FullPageLoader } from "@/components/ui/spinner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { staffFormSchema, StaffFormValues } from "@/features/staff/schemas";
import { FormDialog } from "@/components/common/FormDialog";
import StaffForm from "@/features/staff/components/StaffForm";
import { FullStaffProfile } from "@/features/staff/types";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { useRoles } from "@/features/user/hooks/useRoles";

export default function StaffPage() {
  const { data: staffList = [], isLoading } = useStaff();
  const { data: roles = [] } = useRoles();
  const addStaffMutation = useAddStaff();
  const updateStaffMutation = useUpdateStaff();
  const deleteStaffMutation = useDeleteStaff();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<FullStaffProfile | null>(
    null
  );

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<FullStaffProfile | null>(
    null
  );

  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [rowsToDelete, setRowsToDelete] = useState<FullStaffProfile[]>([]);

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      role_id: "",
    },
  });

  const handleOpenAddForm = () => {
    setEditingStaff(null);
    form.reset({
      full_name: "",
      email: "",
      phone: "",
      role_id: "",
    });
    setIsFormOpen(true);
  };

  const handleOpenDeleteDialog = (staff: FullStaffProfile) => {
    setStaffToDelete(staff);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (staffToDelete) {
      deleteStaffMutation.mutate(staffToDelete.id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setStaffToDelete(null);
        },
      });
    }
  };

  const handleOpenBulkDeleteDialog = (selectedRows: FullStaffProfile[]) => {
    setRowsToDelete(selectedRows);
    setIsBulkDeleteDialogOpen(true);
  };

  const handleConfirmBulkDelete = () => {
    // Gọi mutation cho từng item, hoặc tạo một mutation mới cho bulk delete
    const deletePromises = rowsToDelete.map((row) =>
      deleteStaffMutation.mutateAsync(row.id)
    );
    Promise.all(deletePromises).then(() => {
      setIsBulkDeleteDialogOpen(false);
      setRowsToDelete([]);
    });
  };

  const handleOpenEditForm = (staff: FullStaffProfile) => {
    setEditingStaff(staff);
    form.reset({
      full_name: staff.full_name,
      email: staff.email,
      phone: staff.phone || "",
      role_id: staff.roles[0]?.id || "",
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: StaffFormValues) => {
    if (editingStaff) {
      // Trong khối này, TypeScript biết chắc chắn chúng ta đang gọi updateStaffMutation
      updateStaffMutation.mutate(
        { staffId: editingStaff.id, staffData: data },
        {
          onSuccess: () => setIsFormOpen(false),
        }
      );
    } else {
      // Trong khối này, TypeScript biết chắc chắn chúng ta đang gọi addStaffMutation
      addStaffMutation.mutate(data, {
        onSuccess: () => setIsFormOpen(false),
      });
    }
  };

  const columns = useMemo(
    () => getStaffColumns(handleOpenEditForm, handleOpenDeleteDialog),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const roleFilterOptions = useMemo(
    () => roles.map((role) => ({ label: role.name, value: role.name })),
    [roles]
  );

  const statusFilterOptions = [
    { label: "Hoạt động", value: "active" },
    { label: "Tạm ngưng", value: "inactive" },
  ];

  if (isLoading) {
    return <FullPageLoader text="Đang tải danh sách nhân viên..." />;
  }

  return (
    <>
      <PageHeader
        title="Quản lý nhân viên"
        description="Thêm mới, chỉnh sửa và quản lý thông tin các nhân viên trong hệ thống."
        actionNode={
          <Button onClick={handleOpenAddForm}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm nhân viên
          </Button>
        }
      />
      {/* Truyền columns đã được tạo với các hàm xử lý */}
      <DataTable
        columns={columns}
        data={staffList}
        toolbarProps={{
          searchColumnId: "full_name",
          searchPlaceholder: "Lọc theo tên nhân viên...",
          facetedFilters: [
            {
              columnId: "roles",
              title: "Vai trò",
              options: roleFilterOptions,
            },
            {
              columnId: "is_active",
              title: "Trạng thái",
              options: statusFilterOptions,
            },
          ],
          onDeleteSelected: handleOpenBulkDeleteDialog,
        }}
      />

      <FormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={
          editingStaff ? "Chỉnh sửa thông tin nhân viên" : "Thêm nhân viên mới"
        }
        description="Điền đầy đủ các thông tin dưới đây."
        form={form}
        onFormSubmit={handleFormSubmit}
        isSubmitting={
          addStaffMutation.isPending || updateStaffMutation.isPending
        }
        submitText={editingStaff ? "Lưu thay đổi" : "Tạo mới"}
      >
        <StaffForm />
      </FormDialog>

      <ConfirmationModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa nhân viên"
        description={`Bạn có chắc chắn muốn xóa nhân viên "${staffToDelete?.full_name}" không? Hành động này không thể hoàn tác.`}
        isDestructive
        confirmText="Vẫn xóa"
        // Prop `trigger` đã bị loại bỏ
      />

      <ConfirmationModal
        isOpen={isBulkDeleteDialogOpen}
        onClose={() => setIsBulkDeleteDialogOpen(false)}
        onConfirm={handleConfirmBulkDelete}
        title={`Xác nhận xóa ${rowsToDelete.length} nhân viên`}
        description="Bạn có chắc chắn muốn xóa các nhân viên đã chọn không? Hành động này không thể hoàn tác."
        isDestructive
        confirmText={`Xóa (${rowsToDelete.length})`}
      />
    </>
  );
}
