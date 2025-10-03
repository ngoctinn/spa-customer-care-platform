// src/app/(public)/checkout/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

import { useAuth } from "@/contexts/AuthContexts";
import useCartStore from "@/features/cart/stores/cart-store";
import { useCustomers } from "@/features/customer/hooks/useCustomers";
import {
  createInvoice,
  InvoiceCreationData,
} from "@/features/checkout/api/invoice.api";
import {
  shippingSchema,
  ShippingFormValues,
} from "@/features/checkout/schemas";
import {
  PaymentMethod,
  InvoiceItem,
  InvoiceItemType,
} from "@/features/checkout/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { FullPageLoader } from "@/components/ui/spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, clearCart } = useCartStore();
  const { data: customers = [], isLoading: isLoadingCustomers } =
    useCustomers();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null
  );

  const hasShippableItems = items.some((item) => item.type === "product");

  const form = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: { address: "", notes: "" },
  });

  const currentUserProfile = customers.find((c) => c.user_id === user?.id);

  useEffect(() => {
    if (!isLoadingCustomers) {
      if (!user) {
        toast.error("Vui lòng đăng nhập để tiến hành thanh toán.");
        router.push("/auth/login?redirectTo=/cart");
      } else if (items.length === 0) {
        toast.info("Giỏ hàng của bạn đang trống.");
        router.push("/products");
      }
    }
  }, [user, items, isLoadingCustomers, router]);

  const createInvoiceMutation = useMutation({
    mutationFn: createInvoice,
    onSuccess: (newInvoice) => {
      toast.success(`Tạo hóa đơn thành công!`, {
        description: "Cảm ơn bạn đã mua hàng.",
      });
      clearCart();
      router.push("/");
    },
    onError: (error: unknown) => {
      // Log lỗi chi tiết cho dev
      console.error("Create invoice failed:", error);

      // Hiển thị thông báo thân thiện cho người dùng
      toast.error("Thanh toán thất bại!", {
        description:
          "Đã có lỗi xảy ra trong quá trình xử lý. Vui lòng thử lại hoặc liên hệ hỗ trợ.",
      });
    },
  });

  const handleConfirmPayment = (shippingData: ShippingFormValues) => {
    if (!currentUserProfile || items.length === 0 || !paymentMethod) {
      toast.warning(
        "Vui lòng điền đầy đủ thông tin và chọn phương thức thanh toán."
      );
      return;
    }

    const subtotal = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    // <-- SỬA LỖI MAP INVOICEITEM
    const invoiceItems: InvoiceItem[] = items.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price_per_unit: item.price,
      total_price: item.price * item.quantity,
      type: item.type as InvoiceItemType,
      discount_amount: 0, // Mặc định không giảm giá cho từng sản phẩm
    }));

    const invoiceData: InvoiceCreationData = {
      customer_id: currentUserProfile.id,
      items: invoiceItems,
      subtotal,
      discount_amount: 0,
      tax_amount: 0,
      total_amount: subtotal, // Giả sử không có giảm giá, thuế
      payment_method: paymentMethod,
      status: "paid",
      is_deleted: false,
      created_at: new Date(),
      updated_at: new Date(),
    };

    if (hasShippableItems) {
      // <-- SỬA LỖI TÊN THUỘC TÍNH
      invoiceData.shipping_address = {
        name: currentUserProfile.name,
        phone: currentUserProfile.phone,
        address: shippingData.address,
        city: "TP. Hồ Chí Minh",
        notes: shippingData.notes,
      };
    }

    createInvoiceMutation.mutate(invoiceData);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const total = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  if (isLoadingCustomers || !currentUserProfile) {
    return <FullPageLoader text="Đang tải thông tin thanh toán..." />;
  }

  return (
    <div className="container mx-auto py-12 max-w-4xl">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/cart">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại giỏ hàng
        </Link>
      </Button>

      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(handleConfirmPayment)}
          className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-8 lg:gap-12"
        >
          {/* Cột trái: Thông tin */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin khách hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold">{currentUserProfile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {currentUserProfile.email}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentUserProfile.phone}
                </p>
              </CardContent>
            </Card>

            {hasShippableItems && (
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin nhận hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Địa chỉ</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ghi chú (tùy chọn)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ví dụ: Giao hàng trong giờ hành chính"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Phương thức thanh toán</CardTitle>
              </CardHeader>
              <CardContent>
                <ToggleGroup
                  type="single"
                  variant="outline"
                  className="w-full grid grid-cols-1 sm:grid-cols-2"
                  value={paymentMethod || ""}
                  onValueChange={(value: PaymentMethod) => {
                    if (value) setPaymentMethod(value);
                  }}
                >
                  {hasShippableItems && (
                    <ToggleGroupItem value="cod">
                      Tiền mặt khi nhận hàng (COD)
                    </ToggleGroupItem>
                  )}
                  <ToggleGroupItem value="transfer">
                    Chuyển khoản
                  </ToggleGroupItem>
                </ToggleGroup>
              </CardContent>
            </Card>
          </div>

          {/* Cột phải: Tóm tắt đơn hàng */}
          <div>
            <Card className="lg:sticky lg:top-24">
              <CardHeader>
                <CardTitle>Tóm tắt đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ScrollArea className="h-64 pr-4">
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between gap-4"
                      >
                        <div className="flex items-start gap-4">
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="rounded-md object-cover border"
                          />
                          <div>
                            <p className="font-medium text-sm line-clamp-2">
                              {item.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              SL: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-medium whitespace-nowrap">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Tổng cộng</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={!paymentMethod || createInvoiceMutation.isPending}
                >
                  {createInvoiceMutation.isPending
                    ? "Đang xử lý..."
                    : `Hoàn tất đơn hàng`}
                </Button>
              </CardContent>
            </Card>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
