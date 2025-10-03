"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle } from "lucide-react";
import {
  useServices,
  useAddService,
  useUpdateService,
  useDeleteService,
} from "@/features/service/hooks/useServices";
import { getServiceColumns } from "@/features/service/components/columns";
import {
  ServiceFormValues,
  serviceFormSchema,
} from "@/features/service/schemas";
import { Service } from "@/features/service/types";
import { DataTable } from "@/features/staff/components/data-table"; // Tái sử dụng DataTable
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/common/FormDialog";
import ServiceFormFields from "@/features/service/components/ServiceForm";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { FullPageLoader } from "@/components/ui/spinner";

export default function ServicesDashboardPage() {
  const { data: services = [], isLoading } = useServices();
  const addServiceMutation = useAddService();
  const updateServiceMutation = useUpdateService();
  const deleteServiceMutation = useDeleteService();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: "",
      description: "",
      categories: [],
      price: 0,
      duration_minutes: 30,
    },
  });

  const handleOpenAddForm = () => {
    setEditingService(null);
    form.reset();
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (service: Service) => {
    setEditingService(service);
    form.reset({
      ...service,
      categories: service.categories.map((c) => c.id), // Chỉ lấy ID cho form
    });
    setIsFormOpen(true);
  };

  const handleOpenDeleteDialog = (service: Service) => {
    setServiceToDelete(service);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (serviceToDelete) {
      deleteServiceMutation.mutate(serviceToDelete.id, {
        onSuccess: () => setIsDeleteDialogOpen(false),
      });
    }
  };

  const handleFormSubmit = (data: ServiceFormValues) => {
    if (editingService) {
      updateServiceMutation.mutate(
        { serviceId: editingService.id, serviceData: data },
        {
          onSuccess: () => setIsFormOpen(false),
        }
      );
    } else {
      addServiceMutation.mutate(data, {
        onSuccess: () => setIsFormOpen(false),
      });
    }
  };

  const columns = useMemo(
    () => getServiceColumns(handleOpenEditForm, handleOpenDeleteDialog),
    []
  );

  if (isLoading) {
    return <FullPageLoader text="Đang tải danh sách dịch vụ..." />;
  }

  return (
    <>
      <PageHeader
        title="Quản lý Dịch vụ"
        description="Thêm mới, chỉnh sửa và quản lý tất cả dịch vụ của spa."
        actionNode={
          <Button onClick={handleOpenAddForm}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm dịch vụ
          </Button>
        }
      />
      <DataTable columns={columns} data={services} />

      <FormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingService ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}
        description="Điền đầy đủ các thông tin cần thiết dưới đây."
        form={form}
        onFormSubmit={handleFormSubmit}
        isSubmitting={
          addServiceMutation.isPending || updateServiceMutation.isPending
        }
        submitText={editingService ? "Lưu thay đổi" : "Tạo mới"}
      >
        <ServiceFormFields />
      </FormDialog>

      <ConfirmationModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa dịch vụ"
        description={`Bạn có chắc chắn muốn xóa dịch vụ "${serviceToDelete?.name}" không?`}
        isDestructive
      />
    </>
  );
}
