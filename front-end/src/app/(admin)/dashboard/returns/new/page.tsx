// src/app/(admin)/dashboard/returns/new/page.tsx
"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useReturnProcess } from "@/features/returns/hooks/useReturnProcess";
import InvoiceSearchStep from "@/features/returns/components/InvoiceSearchStep";
import ReturnItemSelectionStep from "@/features/returns/components/ReturnItemSelectionStep";
import RefundProcessingStep from "@/features/returns/components/RefundProcessingStep";
import { useCustomerById } from "@/features/customer/hooks/useCustomers";

export default function NewReturnPage() {
  const {
    step,
    selectedInvoice,
    itemsToReturn,
    refundMethod,
    totalRefundAmount,
    isPending,
    reason,
    goToPrevStep,
    handleInvoiceSelect,
    handleItemQuantityChange,
    setRefundMethod,
    handleSubmitReturn,
    setReason,
  } = useReturnProcess();

  // Lấy thông tin khách hàng để hiển thị công nợ
  const { data: customer } = useCustomerById(
    selectedInvoice?.customer_id || ""
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return <InvoiceSearchStep onInvoiceSelect={handleInvoiceSelect} />;
      case 2:
        if (!selectedInvoice) return null;
        return (
          <ReturnItemSelectionStep
            invoice={selectedInvoice}
            itemsToReturn={itemsToReturn}
            onItemQuantityChange={handleItemQuantityChange}
          />
        );
      case 3:
        return (
          <RefundProcessingStep
            customer={customer || null}
            itemsToReturn={itemsToReturn}
            totalRefundAmount={totalRefundAmount}
            refundMethod={refundMethod}
            onRefundMethodChange={setRefundMethod}
            reason={reason}
            onReasonChange={setReason}
          />
        );
      // Có thể thêm bước 4 (Xác nhận) nếu muốn
      default:
        return null;
    }
  };

  return (
    <>
      <PageHeader
        title="Trả hàng & Hoàn tiền"
        description="Xử lý yêu cầu trả hàng/hoàn tiền từ khách hàng."
      />

      <div className="max-w-4xl mx-auto">
        {step > 1 && (
          <Button
            variant="ghost"
            onClick={goToPrevStep}
            className="mb-4"
            disabled={isPending}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        )}

        {renderStep()}

        <div className="flex justify-end mt-6">
          {step === 2 && (
            <Button onClick={goToPrevStep} disabled={isPending}>
              Tiếp tục
            </Button>
          )}
          {step === 3 && (
            <Button onClick={handleSubmitReturn} disabled={isPending}>
              {isPending ? "Đang xử lý..." : "Hoàn tất Trả hàng"}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
