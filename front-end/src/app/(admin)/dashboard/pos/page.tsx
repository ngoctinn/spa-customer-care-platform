"use client";

import { Suspense } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { PosClient } from "@/features/checkout/components/pos/PosClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DebtPaymentForm } from "@/features/checkout/components/pos/DebtPaymentForm";
import { Card, CardContent } from "@/components/ui/card";

export default function PosPage() {
  return (
    <>
      <PageHeader
        title="Thanh toán tại quầy (POS)"
        description="Tạo đơn hàng, thực hiện thanh toán và quản lý công nợ cho khách hàng."
      />
      <Tabs defaultValue="sale" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sale">Bán hàng & Dịch vụ</TabsTrigger>
          <TabsTrigger value="debt">Thanh toán Công nợ</TabsTrigger>
        </TabsList>
        <TabsContent value="sale">
          <Suspense fallback={<div>Đang tải...</div>}>
            <PosClient />
          </Suspense>
        </TabsContent>
        <TabsContent value="debt">
          <Card>
            <CardContent className="pt-6">
              <DebtPaymentForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
