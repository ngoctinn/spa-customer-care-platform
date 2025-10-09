// src/app/(admin)/dashboard/roles/[roleId]/page.tsx
"use client";

import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getRoles } from "@/features/user/apis/role.api";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { FullPageLoader } from "@/components/ui/spinner";
import {
  PermissionsFormValues,
  permissionsFormSchema,
} from "@/features/user/schemas";
import PermissionsForm from "@/features/user/components/PermissionsForm";
import { useUpdateRolePermissions } from "@/features/user/hooks/useRoles";

interface RoleDetailPageProps {
  params: { roleId: string };
}

export default function RoleDetailPage({ params }: RoleDetailPageProps) {
  const { roleId } = params;

  // Lấy chi tiết vai trò
  const { data: role, isLoading: isLoadingRole } = useQuery({
    queryKey: ["roles", roleId],
    queryFn: async () => {
      // Tạm thời dùng getRoles và find, nên thay bằng API getRoleById(roleId)
      const roles = await getRoles();
      return roles.find((r) => r.id === roleId);
    },
    enabled: !!roleId,
  });

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
    updatePermissionsMutation.mutate({
      roleId,
      permissionIds: data.permissionIds,
    });
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
