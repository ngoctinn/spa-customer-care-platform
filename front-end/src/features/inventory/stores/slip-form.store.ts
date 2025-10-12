// src/features/inventory/stores/slip-form.store.ts
import { create } from "zustand";
import { SlipItem } from "@/features/inventory/types";
import { Product } from "@/features/product/types";

interface SlipFormState {
  items: SlipItem[];
  addItem: (product: Product, isImport: boolean) => void;
  removeItem: (productId: string) => void;
  updateItem: (productId: string, newValues: Partial<SlipItem>) => void;
  clearItems: () => void;
  setItems: (items: SlipItem[]) => void;
}

export const useSlipFormStore = create<SlipFormState>((set) => ({
  items: [],
  addItem: (product, isImport) =>
    set((state) => {
      // Kiểm tra sản phẩm đã tồn tại chưa
      const existingItem = state.items.find(
        (item) => item.product_id === product.id
      );
      if (existingItem) {
        return state; // Không thêm nếu đã có
      }
      const newItem: SlipItem = {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        unit_price: isImport ? product.price : 0, // Chỉ lấy giá cho phiếu nhập
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
  setItems: (items) => set({ items }),
}));
