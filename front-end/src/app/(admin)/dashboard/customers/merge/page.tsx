"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Users, AlertTriangle } from "lucide-react";

import { FullCustomerProfile } from "@/features/customer/types";
import {
  getCustomerById,
  mergeCustomers,
} from "@/features/customer/api/customer.api";

import { PageHeader } from "@/components/common/PageHeader";
import { FullPageLoader } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import Link from "next/link";

// Helper hook để fetch nhiều khách hàng
const useCustomersByIds = (ids: string[]) => {
  return useQuery({
    queryKey: ["customers", "merge", ids],
    queryFn: async () => {
      const customerPromises = ids.map((id) => getCustomerById(id));
      return Promise.all(customerPromises);
    },
    enabled: ids.length >= 2,
  });
};

function MergeClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const ids = useMemo(
    () => searchParams.get("ids")?.split(",") || [],
    [searchParams]
  );

  const [mainCustomerId, setMainCustomerId] = useState<string | null>(null);
  const [fieldOverrides, setFieldOverrides] = useState<
    Partial<FullCustomerProfile>
  >({});
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const { data: customers = [], isLoading, isError } = useCustomersByIds(ids);

  const { mutate: mergeMutation, isPending: isMerging } = useMutation({
    mutationFn: mergeCustomers,
    onSuccess: () => {
      toast.success("Hợp nhất khách hàng thành công!");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      router.push("/dashboard/customers");
    },
    onError: (error) => {
      toast.error("Hợp nhất thất bại", { description: error.message });
    },
  });

  useEffect(() => {
    if (customers.length > 0 && !mainCustomerId) {
      setMainCustomerId(customers[0].id);
    }
  }, [customers, mainCustomerId]);

  const mainCustomer = useMemo(
    () => customers.find((c) => c.id === mainCustomerId),
    [customers, mainCustomerId]
  );
  const sourceCustomers = useMemo(
    () => customers.filter((c) => c.id !== mainCustomerId),
    [customers, mainCustomerId]
  );

  const handleFieldSelect = (field: keyof FullCustomerProfile, value: any) => {
    setFieldOverrides((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleConfirmMerge = () => {
    if (!mainCustomerId || sourceCustomers.length === 0) {
      toast.error("Phải chọn một hồ sơ chính và ít nhất một hồ sơ phụ.");
      return;
    }

    const finalOverrides: Partial<FullCustomerProfile> = {};
    const mainProfile = customers.find((c) => c.id === mainCustomerId)!;

    // Lấy các giá trị cuối cùng, ưu tiên override, sau đó là hồ sơ chính
    const fieldsToMerge: (keyof FullCustomerProfile)[] = [
      "full_name",
      "phone_number",
      "email",
      "note",
    ];
    fieldsToMerge.forEach((field) => {
      const key = field as keyof typeof finalOverrides;
      (finalOverrides as any)[key] = fieldOverrides[key] ?? mainProfile[key];
    });

    mergeMutation({
      mainCustomerId,
      sourceCustomerIds: sourceCustomers.map((c) => c.id),
      fieldOverrides: finalOverrides,
    });
  };

  if (isLoading) {
    return <FullPageLoader text="Đang tải thông tin khách hàng..." />;
  }

  if (isError) {
    return <div>Lỗi khi tải dữ liệu. Vui lòng thử lại.</div>;
  }

  if (customers.length < 2) {
    return (
      <div>
        <PageHeader
          title="Hợp nhất khách hàng"
          description="Vui lòng chọn ít nhất 2 khách hàng để hợp nhất."
        />
        <Button variant="outline" asChild>
          <Link href="/dashboard/customers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Link>
        </Button>
      </div>
    );
  }

  const fields: { key: keyof FullCustomerProfile; label: string }[] = [
    { key: "full_name", label: "Họ và tên" },
    { key: "phone_number", label: "Số điện thoại" },
    { key: "email", label: "Email" },
    { key: "note", label: "Ghi chú" },
  ];

  return (
    <>
      <PageHeader
        title="Hợp nhất Khách hàng"
        description="Chọn hồ sơ chính và đối chiếu thông tin trước khi xác nhận."
        actionNode={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Hủy
            </Button>
            <Button
              onClick={() => setIsConfirmModalOpen(true)}
              disabled={isMerging}
            >
              <Users className="mr-2 h-4 w-4" />
              {isMerging ? "Đang xử lý..." : "Xác nhận Hợp nhất"}
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Đối chiếu thông tin</CardTitle>
          <CardDescription>
            Chọn một hồ sơ làm hồ sơ chính và chọn các thông tin cần giữ lại.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <tbody className="divide-y divide-border">
                {/* Dòng chọn hồ sơ chính */}
                <TableRow>
                  <TableCell className="font-semibold w-1/4">
                    Hồ sơ chính
                  </TableCell>
                  {customers.map((customer) => (
                    <TableCell key={customer.id} className="text-center">
                      <RadioGroup
                        value={mainCustomerId || ""}
                        onValueChange={setMainCustomerId}
                        className="justify-center"
                      >
                        <RadioGroupItem
                          value={customer.id}
                          id={`main-${customer.id}`}
                        />
                      </RadioGroup>
                    </TableCell>
                  ))}
                </TableRow>

                {/* Các dòng thông tin */}
                {fields.map(({ key, label }) => (
                  <TableRow key={key}>
                    <TableCell className="font-semibold">{label}</TableCell>
                    {customers.map((customer) => (
                      <TableCell key={customer.id}>
                        <div
                          className={`p-2 rounded-md cursor-pointer border ${
                            (fieldOverrides[key] ?? mainCustomer?.[key]) ===
                            customer[key]
                              ? "bg-primary/10 border-primary"
                              : "hover:bg-muted/50"
                          }`}
                          onClick={() => handleFieldSelect(key, customer[key])}
                        >
                          {String(customer[key] || "Trống")}
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmMerge}
        title="Xác nhận Hợp nhất Khách hàng"
        description={
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Hành động không thể hoàn tác!</AlertTitle>
              <AlertDescription>
                Bạn có chắc chắn muốn hợp nhất các hồ sơ này không?
              </AlertDescription>
            </Alert>
            <p>
              Hồ sơ chính được giữ lại:{" "}
              <strong>{mainCustomer?.full_name}</strong> (
              {mainCustomer?.phone_number})
            </p>
            <p>Các hồ sơ sau sẽ bị vô hiệu hóa và dữ liệu sẽ được chuyển đi:</p>
            <ul className="list-disc pl-5">
              {sourceCustomers.map((c) => (
                <li key={c.id}>
                  <strong>{c.full_name}</strong> ({c.phone_number})
                </li>
              ))}
            </ul>
          </div>
        }
        confirmText="Tôi chắc chắn, Hợp nhất"
        isDestructive
      />
    </>
  );
}

export default function MergePage() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <MergeClient />
    </Suspense>
  );
}
