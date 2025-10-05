// src/app/(public)/checkout/success/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ClipboardCopy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FullPageLoader } from "@/components/ui/spinner";
import useCartStore from "@/features/cart/stores/cart-store";
import { getInvoiceById } from "@/features/checkout/api/invoice.api";
import { Invoice } from "@/features/checkout/types";
import { toast } from "sonner";

export default function OrderSuccessPage() {
  const { clearCart } = useCartStore();
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get("invoiceId");

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Chỉ chạy một lần khi component được mount
    clearCart();

    if (invoiceId) {
      const fetchInvoice = async () => {
        try {
          setIsLoading(true);
          const fetchedInvoice = await getInvoiceById(invoiceId);
          setInvoice(fetchedInvoice);
        } catch (err) {
          setError("Không thể tải thông tin đơn hàng. Vui lòng thử lại.");
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchInvoice();
    } else {
      setError("Không tìm thấy mã đơn hàng.");
      setIsLoading(false);
    }
  }, [invoiceId, clearCart]);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${fieldName}!`);
  };

  if (isLoading) {
    return <FullPageLoader text="Đang tải thông tin đơn hàng..." />;
  }

  if (error || !invoice) {
    return (
      <div className="container text-center py-20">
        <h2 className="text-2xl font-bold text-destructive">Lỗi</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button asChild className="mt-4">
          <Link href="/">Quay về trang chủ</Link>
        </Button>
      </div>
    );
  }

  const isBankTransfer = invoice.payment_method === "transfer";
  const orderCode = `TT${invoice.id.substring(0, 8).toUpperCase()}`;

  return (
    <div className="container mx-auto max-w-2xl py-12">
      <div className="flex flex-col items-center text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
        <h1 className="text-3xl font-bold mb-2">Đặt hàng thành công!</h1>
        <p className="text-muted-foreground mb-6">
          Cảm ơn bạn đã tin tưởng. Dưới đây là thông tin chi tiết đơn hàng của
          bạn.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Đơn hàng #{invoice.id.substring(0, 8).toUpperCase()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Item Summary */}
          <div className="space-y-2">
            {invoice.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <p className="text-muted-foreground">
                  {item.name} <span className="text-xs">x{item.quantity}</span>
                </p>
                <p className="font-medium">
                  {new Intl.NumberFormat("vi-VN").format(item.total_price)}đ
                </p>
              </div>
            ))}
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-lg">
            <p>Tổng cộng</p>
            <p>
              {new Intl.NumberFormat("vi-VN").format(invoice.total_amount)}đ
            </p>
          </div>
          <Separator />

          {/* Payment Instructions */}
          {isBankTransfer ? (
            <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
              <h3 className="font-semibold">Hướng dẫn thanh toán</h3>
              <p className="text-sm text-muted-foreground">
                Vui lòng chuyển khoản chính xác số tiền với nội dung bên dưới để
                đơn hàng được xác nhận tự động.
              </p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Ngân hàng:</span>
                  <span className="font-semibold">Vietcombank</span>
                </div>
                <div className="flex justify-between">
                  <span>Chủ tài khoản:</span>
                  <span className="font-semibold">SERENITY SPA</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Số tài khoản:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">0123456789</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() =>
                        copyToClipboard("0123456789", "số tài khoản")
                      }
                    >
                      <ClipboardCopy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Nội dung:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-destructive">
                      {orderCode}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(orderCode, "nội dung")}
                    >
                      <ClipboardCopy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-4">
              <h3 className="font-semibold">Thanh toán khi nhận hàng (COD)</h3>
              <p className="text-sm text-muted-foreground">
                Vui lòng chuẩn bị số tiền thanh toán là{" "}
                <span className="font-bold">
                  {new Intl.NumberFormat("vi-VN").format(invoice.total_amount)}đ
                </span>
                .
              </p>
            </div>
          )}

          <Button asChild className="w-full mt-4">
            <Link href="/">Tiếp tục mua sắm</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
