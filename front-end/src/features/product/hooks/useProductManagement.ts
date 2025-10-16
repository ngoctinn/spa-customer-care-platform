import { useResourceManagement } from "@/features/management-pages/hooks/useResourceManagement";
import { useProducts } from "./useProducts";
import { Product } from "../types";
import {
  ProductFormValues,
  productFormSchema,
  StockAdjustmentFormValues,
  stockAdjustmentSchema,
} from "../schemas";
import {
  addProduct,
  updateProduct,
  deleteProduct,
} from "@/features/product/api/product.api";
import { useAdjustStock } from "@/features/inventory/hooks/useInventory";
import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export function useProductManagement() {
  const resourceManagement = useResourceManagement<Product, ProductFormValues>({
    queryKey: ["products"],
    useDataHook: useProducts,
    addFn: addProduct,
    updateFn: (vars) =>
      updateProduct({ productId: vars.id, productData: vars.data }),
    deleteFn: deleteProduct,
    formSchema: productFormSchema,
    defaultFormValues: {
      name: "",
      description: "",
      price: 0,
      isRetail: true,
      isConsumable: false,
      baseUnit: "cái",
      category_ids: [],
      images: [],
      low_stock_threshold: 0,
    },
    getEditFormValues: (product) => ({
      name: product.name,
      description: product.description || "",
      category_ids: product.categories.map((c) => c.id),
      price: product.price || 0,
      images: product.images || [],
      isRetail: product.is_retail ?? false,
      isConsumable: product.is_consumable ?? false,
      baseUnit: product.base_unit,
      consumableUnit: product.consumable_unit || "",
      conversionRate: product.conversion_rate || 0,
      low_stock_threshold: product.low_stock_threshold,
    }),
    customMessages: {
      addSuccess: "Thêm sản phẩm thành công!",
      updateSuccess: "Cập nhật sản phẩm thành công!",
      deleteSuccess: "Đã xóa sản phẩm!",
    },
  });

  const adjustStockMutation = useAdjustStock();

  // --- State & Forms for additional logic (stock adjustment) ---
  const [isStockFormOpen, setIsStockFormOpen] = useState(false);
  const [productToAdjust, setProductToAdjust] = useState<Product | null>(null);

  const stockForm = useForm<StockAdjustmentFormValues>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: { productId: "", quantity: 1, notes: "" },
  });

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

  return {
    ...resourceManagement,
    // Extra properties specific to this hook
    stockForm,
    isStockFormOpen,
    productToAdjust,
    isAdjustingStock: adjustStockMutation.isPending,
    handleOpenAdjustStockForm,
    handleCloseStockForm,
    handleStockFormSubmit,
  };
}
