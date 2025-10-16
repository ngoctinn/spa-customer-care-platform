// src/features/inventory/stores/slip-form.store.ts
import { create } from "zustand";
import { SlipItem } from "@/features/inventory/types";
import { Product } from "@/features/product/types";

// ++ BỔ SUNG: Mở rộng SlipItem để chứa thông tin tồn kho ++
export interface SlipItemWithStock extends SlipItem {
  stock_quantity: number;
}

interface SlipFormState {
  items: SlipItemWithStock[];
  addItem: (product: Product, isImport: boolean) => void;
  removeItem: (productId: string) => void;
  updateItem: (
    productId: string,
    newValues: Partial<SlipItemWithStock>
  ) => void;
  clearItems: () => void;
  setItems: (items: SlipItem[]) => void;
}

export const useSlipFormStore = create<SlipFormState>((set) => ({
  items: [],
  addItem: (product, isImport) =>
    set((state) => {
      const existingItem = state.items.find(
        (item) => item.product_id === product.id
      );
      if (existingItem) {
        return state;
      }
      // ++ THAY ĐỔI: Thêm stock_quantity khi tạo item mới ++
      const newItem: SlipItemWithStock = {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        unit_price: isImport ? product.price : 0,
        stock_quantity: product.stock, // <-- Lưu lại tồn kho
      };
      return { items: [...state.items, newItem] };
    }),
  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((item) => item.product_id !== productId),
    })),
  updateItem: (productId, newValues) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.product_id === productId ? { ...item, ...newValues } : item
      ),
    })),
  clearItems: () => set({ items: [] }),
  // ++ THAY ĐỔI: Xử lý khi set lại items (ví dụ: lúc edit)
  setItems: (items) =>
    set({
      items: items.map((item) => ({
        ...item,
        // Giả định stock_quantity sẽ cần được lấy từ một nguồn khác khi edit,
        // ở đây ta tạm gán bằng quantity để tránh lỗi,
        // logic lấy tồn kho đúng sẽ nằm ở component.
        stock_quantity: (item as any).stock_quantity || item.quantity,
      })),
    }),
}));
