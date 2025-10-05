// src/app/(admin)/dashboard/products/page.tsx
"use client";

import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";

import { useProducts } from "@/features/product/hooks/useProducts";
import { getProductColumns } from "@/features/product/components/columns";
import { Product } from "@/features/product/types";
import {
  ProductFormValues,
  productFormSchema,
  stockAdjustmentSchema,
  StockAdjustmentFormValues,
} from "@/features/product/schemas";
import {
  useAddProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/features/product/hooks/useProducts";

import { useAdjustStock } from "@/features/inventory/hooks/useInventory";

import { DataTable } from "@/components/common/data-table/data-table";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/common/FormDialog";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { FullPageLoader } from "@/components/ui/spinner";
import ProductFormFields from "@/features/product/components/ProductForm";
import StockAdjustmentForm from "@/features/inventory/components/StockAdjustmentForm";
import { Category } from "@/features/category/types";

export default function ProductsDashboardPage() {
  const { data: products = [], isLoading } = useProducts();

  // Mutations for Product CRUD
  const addProductMutation = useAddProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();
  // Mutation for Stock Adjustment
  const adjustStockMutation = useAdjustStock();

  // State for Product Form Dialog
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // State for Stock Adjustment Dialog
  const [isStockFormOpen, setIsStockFormOpen] = useState(false);
  const [productToAdjust, setProductToAdjust] = useState<Product | null>(null);

  // State for Delete Confirmation Dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const productForm = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      isRetail: true,
      isConsumable: false,
      baseUnit: "cái",
      categories: [],
      images: [],
    },
  });

  const stockForm = useForm<StockAdjustmentFormValues>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: {
      productId: "",
      quantity: 1,
      notes: "",
    },
  });

  // --- Handlers for Product CRUD ---
  const handleOpenAddProductForm = () => {
    setEditingProduct(null);
    productForm.reset();
    setIsProductFormOpen(true);
  };

  const handleOpenEditProductForm = useCallback(
    (product: Product) => {
      setEditingProduct(product);
      productForm.reset({
        ...product,
        // Đảm bảo categories là mảng các ID
        categories: product.categories.map((c: Category | string) =>
          typeof c === "string" ? c : c.id
        ),
        price: product.price || 0,
        stock: product.stock || 0,
        // Chuyển đổi các giá trị có thể là null/undefined
        description: product.description || "",
      });
      setIsProductFormOpen(true);
    },
    [productForm]
  );

  const handleProductFormSubmit = (data: ProductFormValues) => {
    if (editingProduct) {
      updateProductMutation.mutate(
        { productId: editingProduct.id, productData: data },
        {
          onSuccess: () => setIsProductFormOpen(false),
        }
      );
    } else {
      addProductMutation.mutate(data, {
        onSuccess: () => setIsProductFormOpen(false),
      });
    }
  };

  // --- Handlers for Stock Adjustment ---
  const handleOpenAdjustStockForm = useCallback(
    (product: Product) => {
      setProductToAdjust(product);
      stockForm.reset({
        productId: product.id,
        quantity: 1, // Mặc định là nhập 1
        notes: "",
      });
      setIsStockFormOpen(true);
    },
    [stockForm]
  );

  const handleStockFormSubmit = (data: StockAdjustmentFormValues) => {
    adjustStockMutation.mutate(data, {
      onSuccess: () => {
        setIsStockFormOpen(false);
        // Không cần invalidate, vì useAdjustStock hook đã làm điều đó
      },
    });
  };

  // --- Handlers for Deletion ---
  const handleOpenDeleteDialog = useCallback((product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteProductMutation.mutate(productToDelete.id, {
        onSuccess: () => {
          toast.success("Xóa sản phẩm thành công!");
          setIsDeleteDialogOpen(false);
          setProductToDelete(null);
          // queryClient.invalidateQueries({ queryKey: ["products"] }); // Hook đã tự làm
        },
      });
    }
  };

  const columns = useMemo(
    () =>
      getProductColumns(
        handleOpenEditProductForm,
        handleOpenDeleteDialog,
        handleOpenAdjustStockForm // Truyền hàm xử lý vào columns
      ),
    [
      handleOpenEditProductForm,
      handleOpenDeleteDialog,
      handleOpenAdjustStockForm,
    ]
  );

  if (isLoading) {
    return <FullPageLoader text="Đang tải danh sách sản phẩm..." />;
  }

  return (
    <>
      <PageHeader
        title="Quản lý Sản phẩm"
        description="Thêm mới, chỉnh sửa và quản lý tất cả sản phẩm của spa."
        actionNode={
          <Button onClick={handleOpenAddProductForm}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm sản phẩm
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={products}
        toolbarProps={{
          searchColumnId: "name",
          searchPlaceholder: "Lọc theo tên sản phẩm...",
        }}
      />

      {/* Product Add/Edit Dialog */}
      <FormDialog
        isOpen={isProductFormOpen}
        onClose={() => setIsProductFormOpen(false)}
        title={editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
        description="Điền đầy đủ các thông tin cần thiết dưới đây."
        form={productForm}
        onFormSubmit={handleProductFormSubmit}
        isSubmitting={
          addProductMutation.isPending || updateProductMutation.isPending
        }
        submitText={editingProduct ? "Lưu thay đổi" : "Tạo mới"}
      >
        <ProductFormFields />
      </FormDialog>

      {/* Stock Adjustment Dialog */}
      <FormDialog
        isOpen={isStockFormOpen}
        onClose={() => setIsStockFormOpen(false)}
        title={`Điều chỉnh tồn kho - ${productToAdjust?.name}`}
        description="Nhập số lượng để thêm hoặc bớt khỏi kho hiện tại."
        form={stockForm}
        onFormSubmit={handleStockFormSubmit}
        isSubmitting={adjustStockMutation.isPending}
        submitText="Xác nhận"
      >
        {/* Khóa trường chọn sản phẩm lại vì đã chọn từ trước */}
        <StockAdjustmentForm isProductLocked={true} />
      </FormDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa sản phẩm"
        description={`Bạn có chắc chắn muốn xóa sản phẩm "${productToDelete?.name}" không?`}
        isDestructive
      />
    </>
  );
}
