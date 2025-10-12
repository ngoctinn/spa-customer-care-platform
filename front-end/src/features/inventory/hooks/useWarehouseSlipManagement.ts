// src/features/inventory/hooks/useWarehouseSlipManagement.ts
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import {
  useWarehouseSlips,
  useWarehouseSlipMutations,
} from "./useWarehouseSlips";
import { WarehouseSlip } from "../types";

export function useWarehouseSlipManagement() {
  const router = useRouter();
  const { data: slips = [], isLoading } = useWarehouseSlips();
  const { deleteMutation } = useWarehouseSlipMutations();

  const [slipToView, setSlipToView] = useState<WarehouseSlip | null>(null);
  const [slipToDelete, setSlipToDelete] = useState<WarehouseSlip | null>(null);

  const handleViewDetails = useCallback((slip: WarehouseSlip) => {
    setSlipToView(slip);
  }, []);

  const handleCloseViewDialog = useCallback(() => {
    setSlipToView(null);
  }, []);

  const handleEditSlip = useCallback(
    (slip: WarehouseSlip) => {
      const path =
        slip.type === "IMPORT"
          ? `/dashboard/inventory/warehouse-slips/import/${slip.id}/edit`
          : `/dashboard/inventory/warehouse-slips/export/${slip.id}/edit`;
      router.push(path);
    },
    [router]
  );

  const handleDeleteSlip = useCallback((slip: WarehouseSlip) => {
    setSlipToDelete(slip);
  }, []);

  const handleCloseDeleteDialog = useCallback(() => {
    setSlipToDelete(null);
  }, []);

  const handleConfirmDelete = () => {
    if (slipToDelete) {
      deleteMutation.mutate(slipToDelete.id, {
        onSuccess: () => {
          handleCloseDeleteDialog();
        },
      });
    }
  };

  return {
    slips,
    isLoading,
    slipToView,
    slipToDelete,
    handleViewDetails,
    handleCloseViewDialog,
    handleEditSlip,
    handleDeleteSlip,
    handleCloseDeleteDialog,
    handleConfirmDelete,
    isDeleting: deleteMutation.isPending,
  };
}
