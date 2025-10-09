// src/features/product/hooks/useProductManagement.ts
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

  // ✅ Step 1: Lấy logic CRUD từ useProductMutations
  const {
    addMutation,
    updateMutation,
    deleteMutation,
    isFormOpen: isProductFormOpen, // Đổi tên để phân biệt
    editingItem: editingProduct,
    itemToDelete: productToDelete,
    handleOpenAddForm,
    handleOpenEditForm,
    handleCloseForm: handleCloseProductForm, // Đổi tên
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleConfirmDelete,
  } = useProductMutations();

  // --- Logic cho Dialog điều chỉnh kho (GIỮ NGUYÊN) ---
  const [isStockFormOpen, setIsStockFormOpen] = useState(false);
  const [productToAdjust, setProductToAdjust] = useState<Product | null>(null);

  const productForm = useForm<ProductFormValues>({
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

  // ✅ Step 2: Tạo các hàm "wrapper" để reset form sản phẩm
  const handleOpenAddProductForm = useCallback(() => {
    handleOpenAddForm(); // Gọi hàm gốc
    productForm.reset();
  }, [productForm, handleOpenAddForm]);

  const handleOpenEditProductForm = useCallback(
    (product: Product) => {
      handleOpenEditForm(product); // Gọi hàm gốc
      productForm.reset({
        ...product,
        categories: product.categories.map((c) => c.id),
        price: product.price || 0,
        description: product.description || "",
      });
    },
    [productForm, handleOpenEditForm]
  );

  const handleProductFormSubmit = (data: ProductFormValues) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data });
    } else {
      addMutation.mutate(data);
    }
  };

  // --- Handlers cho Stock Adjustment (GIỮ NGUYÊN) ---
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

  // ✅ Step 3: Trả về các giá trị đã được kết hợp
  return {
    // Data & state
    isLoading,
    products,
    productForm,
    stockForm,
    isProductFormOpen,
    editingProduct,
    isStockFormOpen,
    productToAdjust,
    productToDelete,
    isSubmitting: addMutation.isPending || updateMutation.isPending,
    isAdjustingStock: adjustStockMutation.isPending,
    // CRUD Handlers (đã tối ưu)
    handleOpenAddProductForm,
    handleOpenEditProductForm,
    handleCloseProductForm,
    handleProductFormSubmit,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleConfirmDelete,
    // Stock Adjustment Handlers (giữ nguyên)
    handleOpenAdjustStockForm,
    handleCloseStockForm,
    handleStockFormSubmit,
  };
}
