// src/features/inventory/hooks/useWarehouseSlipManagement.ts
import { useState, useCallback } from "react";
import {
  useWarehouseSlips,
  useWarehouseSlipMutations,
} from "./useWarehouseSlips";
import { WarehouseSlip } from "../types";

export function useWarehouseSlipManagement() {
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
    handleDeleteSlip,
    handleCloseDeleteDialog,
    handleConfirmDelete,
    isDeleting: deleteMutation.isPending,
  };
}
