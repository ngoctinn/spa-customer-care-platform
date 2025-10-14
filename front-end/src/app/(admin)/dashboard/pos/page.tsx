// src/app/(admin)/dashboard/pos/page.tsx
"use client";

import { Suspense } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { PosClient } from "@/features/checkout/components/pos/PosClient";

export default function PosPage() {
  return (
    <>
      <PageHeader
        title="Thanh toán tại quầy (POS)"
        description="Tạo đơn hàng và thực hiện thanh toán cho khách hàng."
      />
      {/* Sử dụng Suspense để xử lý query params phía client */}
      <Suspense fallback={<div>Đang tải...</div>}>
        <PosClient />
      </Suspense>
    </>
  );
}
