// src/app/(public)/checkout/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { createOrder } from "@/features/checkout/api/invoice.api";
import { useAuth } from "@/features/auth/contexts/AuthContexts";
import useCartStore from "@/features/cart/stores/cart-store";
import {
  shippingSchema,
  ShippingFormValues,
} from "@/features/checkout/schemas";
import { PaymentMethod, ShippingAddress } from "@/features/checkout/types";

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
import { useCustomerProfile } from "@/features/customer/hooks/useCustomerProfile";
export default function CheckoutPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { items } = useCartStore();
  const { data: currentUserProfile, isLoading: isLoadingProfile } =
    useCustomerProfile();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (currentUserProfile) {
      form.reset({
        name: currentUserProfile.full_name,
        phone: currentUserProfile.phone_number || "",
        address: "",
        notes: "",
      });
    }
  }, [currentUserProfile, form]);

  useEffect(() => {
    // Chỉ kiểm tra giỏ hàng trống khi component vừa tải và không trong quá trình xử lý
    if (!isAuthLoading && items.length === 0 && !isProcessing) {
      toast.info("Giỏ hàng của bạn đang trống.");
      router.push("/products");
    }
  }, [items, isAuthLoading, router, isProcessing]);

  const hasShippableItems = items.some((item) => item.type === "product");

  const handleConfirmPayment = async (shippingData: ShippingFormValues) => {
    if (!paymentMethod) {
      toast.warning("Vui lòng chọn phương thức thanh toán.");
      return;
    }

    setIsProcessing(true); // <--- Bắt đầu xử lý

    try {
      // Gọi hàm API mới
      const newInvoice = await createOrder({
        items,
        payment_method: paymentMethod,
        shipping_address: hasShippableItems
          ? (shippingData as ShippingAddress)
          : undefined,
        notes: shippingData.notes,
      });

      toast.success("Đã tạo đơn hàng thành công!");

      // Chuyển hướng đến trang success với ID hóa đơn
      router.push(`/checkout/success?invoiceId=${newInvoice.id}`);
    } catch (error) {
      console.error("Create order failed:", error);
      toast.error("Tạo đơn hàng thất bại!", {
        description:
          error instanceof Error
            ? error.message
            : "Đã có lỗi xảy ra. Vui lòng thử lại.",
      });
      setIsProcessing(false); // Dừng xử lý nếu có lỗi
    }
    // Không cần finally vì đã chuyển trang nếu thành công
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

  // Câu lệnh return sớm cho trạng thái loading
  if (isAuthLoading || isLoadingProfile) {
    return <FullPageLoader text="Đang tải thông tin thanh toán..." />;
  }

  // Nếu không có profile sau khi đã tải xong (ví dụ user không phải customer)
  // hoặc giỏ hàng trống, useEffect ở trên sẽ xử lý chuyển hướng.
  // Render null để tránh hiển thị giao diện lỗi trước khi chuyển hướng.
  if (!user || !currentUserProfile || items.length === 0) {
    return null;
  }

  if (!currentUserProfile) {
    // Có thể chuyển hướng hoặc hiển thị lỗi
    toast.error("Không thể tải thông tin khách hàng.");
    router.push("/");
    return null;
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
                <p className="font-semibold">{currentUserProfile.full_name}</p>
                <p className="text-sm text-muted-foreground">
                  {currentUserProfile.email}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentUserProfile.phone_number}
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
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên người nhận</FormLabel>
                        <FormControl>
                          <Input placeholder="Nguyễn Văn A" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số điện thoại nhận hàng</FormLabel>
                        <FormControl>
                          <Input placeholder="09xxxxxxxx" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                  disabled={!paymentMethod || isProcessing}
                >
                  {isProcessing ? "Đang xử lý..." : `Hoàn tất đơn hàng`}
                </Button>
              </CardContent>
            </Card>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
