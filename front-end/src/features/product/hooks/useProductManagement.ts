// src/features/product/hooks/useProductManagement.ts (Corrected Version)
import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  productFormSchema,
  ProductFormValues,
  stockAdjustmentSchema,
  StockAdjustmentFormValues,
} from "../schemas";
import { Product } from "../types";
import { useProducts, useProductMutations } from "./useProducts";
import { useAdjustStock } from "@/features/inventory/hooks/useInventory";

export function useProductManagement() {
  const { data: products = [], isLoading } = useProducts();
  const adjustStockMutation = useAdjustStock();

  const {
    addMutation,
    updateMutation,
    deleteMutation,
    isFormOpen,
    editingItem, // Changed from editingProduct
    itemToDelete, // Changed from productToDelete
    handleOpenAddForm,
    handleOpenEditForm,
    handleCloseForm,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleConfirmDelete,
  } = useProductMutations();

  // --- State & Forms for additional logic (stock adjustment) ---
  const [isStockFormOpen, setIsStockFormOpen] = useState(false);
  const [productToAdjust, setProductToAdjust] = useState<Product | null>(null);

  const form = useForm<ProductFormValues>({
    // Changed from productForm
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      isRetail: true,
      isConsumable: false,
      baseUnit: "cái",
      categories: [],
      images: [],
    },
  });

  const stockForm = useForm<StockAdjustmentFormValues>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: { productId: "", quantity: 1, notes: "" },
  });

  const handleOpenAddFormWithReset = useCallback(() => {
    handleOpenAddForm();
    form.reset();
  }, [form, handleOpenAddForm]);

  const handleOpenEditFormWithReset = useCallback(
    (product: Product) => {
      handleOpenEditForm(product);
      form.reset({
        ...product,
        categories: product.categories.map((c) => c.id),
        price: product.price || 0,
        description: product.description || "",
      });
    },
    [form, handleOpenEditForm]
  );

  const handleFormSubmit = (data: ProductFormValues) => {
    // Changed from handleProductFormSubmit
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      addMutation.mutate(data);
    }
  };

  // --- Stock Adjustment Handlers ---
  const handleOpenAdjustStockForm = useCallback(
    (product: Product) => {
      setProductToAdjust(product);
      stockForm.reset({ productId: product.id, quantity: 1, notes: "" });
      setIsStockFormOpen(true);
    },
    [stockForm]
  );

  const handleCloseStockForm = () => setIsStockFormOpen(false);

  const handleStockFormSubmit = (data: StockAdjustmentFormValues) => {
    adjustStockMutation.mutate(data, {
      onSuccess: handleCloseStockForm,
    });
  };

  // Return object now matches the UseManagementHookResult interface
  return {
    data: products, // Changed from products
    isLoading,
    form, // Changed from productForm
    isFormOpen,
    editingItem,
    itemToDelete,
    isSubmitting: addMutation.isPending || updateMutation.isPending,
    handleOpenAddForm: handleOpenAddFormWithReset,
    handleOpenEditForm: handleOpenEditFormWithReset,
    handleCloseForm,
    handleFormSubmit, // Changed from handleProductFormSubmit
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleConfirmDelete,

    // You can decide if these extra properties should be part of the interface
    // or handled differently. For now, let's assume they are specific to this hook's consumer
    // and not part of the generic interface.
    stockForm,
    isStockFormOpen,
    productToAdjust,
    isAdjustingStock: adjustStockMutation.isPending,
    handleOpenAdjustStockForm,
    handleCloseStockForm,
    handleStockFormSubmit,
  };
}
