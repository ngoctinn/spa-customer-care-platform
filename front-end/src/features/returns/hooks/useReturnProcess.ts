// src/features/returns/hooks/useReturnProcess.ts
"use client";

import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Invoice, InvoiceItem } from "@/features/checkout/types";
import { ReturnItem, RefundMethod, CreateReturnPayload } from "../types";
import { createReturnTransaction } from "../api/return.api";

export function useReturnProcess() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [itemsToReturn, setItemsToReturn] = useState<ReturnItem[]>([]);
  const [refundMethod, setRefundMethod] = useState<RefundMethod>("cash");
  const [reason, setReason] = useState("");

  const totalRefundAmount = useMemo(() => {
    return itemsToReturn.reduce(
      (total, item) => total + item.pricePerUnit * item.quantity,
      0
    );
  }, [itemsToReturn]);

  const { mutate: createReturn, isPending } = useMutation({
    mutationFn: createReturnTransaction,
    onSuccess: () => {
      toast.success("Xử lý trả hàng thành công!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      router.push("/dashboard/orders");
    },
    onError: (error) => {
      toast.error("Xử lý trả hàng thất bại", {
        description: error.message,
      });
    },
  });

  const goToNextStep = () => setStep((s) => s + 1);
  const goToPrevStep = () => setStep((s) => s - 1);

  const handleInvoiceSelect = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setItemsToReturn([]); // Reset items when a new invoice is selected
    goToNextStep();
  };

  const handleItemQuantityChange = (
    invoiceItem: InvoiceItem,
    newQuantity: number
  ) => {
    const originalItem = selectedInvoice?.items.find(
      (item) => item.id === invoiceItem.id
    );
    if (!originalItem) return;

    const clampedQuantity = Math.max(
      0,
      Math.min(newQuantity, originalItem.quantity)
    );

    setItemsToReturn((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.invoiceItemId === invoiceItem.id
      );

      if (clampedQuantity === 0) {
        return prevItems.filter(
          (item) => item.invoiceItemId !== invoiceItem.id
        );
      }

      const newItem: ReturnItem = {
        invoiceItemId: invoiceItem.id,
        productId: invoiceItem.id, // Assuming product ID is the same as invoice item ID for simplicity
        name: invoiceItem.name,
        quantity: clampedQuantity,
        pricePerUnit: invoiceItem.price_per_unit,
      };

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = newItem;
        return updatedItems;
      } else {
        return [...prevItems, newItem];
      }
    });
  };

  const handleSubmitReturn = () => {
    if (!selectedInvoice) {
      toast.error("Không có hóa đơn nào được chọn.");
      return;
    }
    if (itemsToReturn.length === 0) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm để trả.");
      return;
    }

    const payload: CreateReturnPayload = {
      invoiceId: selectedInvoice.id,
      items: itemsToReturn.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      refundMethod,
      reason,
    };

    createReturn(payload);
  };

  const resetProcess = () => {
    setStep(1);
    setSelectedInvoice(null);
    setItemsToReturn([]);
    setRefundMethod("cash");
    setReason("");
  };

  return {
    step,
    selectedInvoice,
    itemsToReturn,
    refundMethod,
    totalRefundAmount,
    isPending,
    reason,
    goToNextStep,
    goToPrevStep,
    handleInvoiceSelect,
    handleItemQuantityChange,
    setRefundMethod,
    handleSubmitReturn,
    resetProcess,
    setReason,
  };
}
