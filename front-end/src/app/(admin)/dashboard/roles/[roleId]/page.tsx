"use client";

import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { FullPageLoader } from "@/components/ui/spinner";
import {
  PermissionsFormValues,
  permissionsFormSchema,
} from "@/features/user/schemas";
import PermissionsForm from "@/features/user/components/PermissionsForm";
import {
  useUpdateRolePermissions,
  useRoleById,
} from "@/features/user/hooks/useRoles";

interface RoleDetailPageProps {
  params: { roleId: string };
}

export default function RoleDetailPage({ params }: RoleDetailPageProps) {
  const { roleId } = params;

  const { data: role, isLoading: isLoadingRole } = useRoleById(roleId);

  const updatePermissionsMutation = useUpdateRolePermissions();

  const form = useForm<PermissionsFormValues>({
    resolver: zodResolver(permissionsFormSchema),
    defaultValues: {
      permissionIds: [],
    },
  });

  useEffect(() => {
    if (role?.permissions) {
      form.reset({
        permissionIds: role.permissions.map((p) => p.id),
      });
    }
  }, [role, form]);

  const onSubmit = (data: PermissionsFormValues) => {
    if (role) {
      updatePermissionsMutation.mutate({
        roleId,
        newPermissionIds: data.permissionIds,
        currentPermissions: role.permissions, // Truyền danh sách quyền hiện tại
      });
    }
  };

  if (isLoadingRole) {
    return <FullPageLoader text="Đang tải thông tin vai trò..." />;
  }

  if (!role) {
    return (
      <div>
        <PageHeader title="Không tìm thấy vai trò" />
        <Button variant="outline" asChild>
          <Link href="/dashboard/roles">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <PageHeader
          title={`Phân quyền cho: ${role.name}`}
          description={
            role.description ||
            "Chọn các quyền hạn bạn muốn gán cho vai trò này."
          }
          actionNode={
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/dashboard/roles">Hủy</Link>
              </Button>
              <Button
                type="submit"
                disabled={updatePermissionsMutation.isPending}
              >
                {updatePermissionsMutation.isPending
                  ? "Đang lưu..."
                  : "Lưu thay đổi"}
              </Button>
            </div>
          }
        />
        <PermissionsForm />
      </form>
    </FormProvider>
  );
}
