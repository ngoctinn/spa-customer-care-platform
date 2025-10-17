"use client";

import { PageHeader } from "@/components/common/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NewReturnPage() {
  return (
    <>
      <PageHeader
        title="Trả hàng & Hoàn tiền"
        description="Tìm hóa đơn và xử lý yêu cầu trả hàng/hoàn tiền từ khách hàng."
      />
      <Card>
        <CardHeader>
          <CardTitle>Chức năng đang phát triển</CardTitle>
          <CardDescription>
            Giao diện và logic cho việc tìm kiếm hóa đơn, chọn sản phẩm trả lại,
            và xử lý hoàn tiền sẽ được xây dựng tại đây.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Các bước thực hiện sẽ bao gồm:
          </p>
          <ul className="list-disc pl-6 mt-2 text-muted-foreground text-sm">
            <li>
              Bước 1: Tìm kiếm hóa đơn theo mã, tên khách hàng, hoặc ngày.
            </li>
            <li>
              Bước 2: Hiển thị chi tiết hóa đơn và cho phép chọn sản phẩm/dịch
              vụ cần trả.
            </li>
            <li>Bước 3: Nhập lý do trả hàng và số lượng.</li>
            <li>
              Bước 4: Chọn phương thức hoàn tiền (Tiền mặt, Ghi có công nợ,
              v.v.).
            </li>
            <li>Bước 5: Xác nhận và hoàn tất giao dịch trả hàng.</li>
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
