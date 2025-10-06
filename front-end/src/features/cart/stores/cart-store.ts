// src/stores/cart-store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";

// Định nghĩa cấu trúc của một sản phẩm trong giỏ hàng
export interface CartItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  type: "product" | "service" | "treatment"; // Thêm thuộc tính type
}

// Định nghĩa cấu trúc của store
interface CartState {
  items: CartItem[];
  addItem: (
    itemToAdd: Omit<CartItem, "quantity"> & { quantity?: number }
  ) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
}

const useCartStore = create<CartState>()(
  // Sử dụng persist middleware để lưu giỏ hàng vào localStorage
  persist(
    (set, get) => ({
      items: [],
      // Thêm sản phẩm vào giỏ hoặc tăng số lượng nếu đã tồn tại
      addItem: (itemToAdd) => {
        const items = get().items;
        const existingItem = items.find((item) => item.id === itemToAdd.id);

        if (existingItem) {
          const updatedItems = items.map((item) =>
            item.id === itemToAdd.id
              ? { ...item, quantity: item.quantity + (itemToAdd.quantity || 1) }
              : item
          );
          set({ items: updatedItems });
        } else {
          set({
            items: [
              ...items,
              { ...itemToAdd, quantity: itemToAdd.quantity || 1 },
            ],
          });
        }
        toast.success(`Đã thêm "${itemToAdd.name}" vào giỏ hàng.`);
      },
      // Xóa sản phẩm khỏi giỏ
      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
        toast.info("Đã xóa sản phẩm khỏi giỏ hàng.");
      },
      // Cập nhật số lượng sản phẩm
      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
        } else {
          set((state) => ({
            items: state.items.map((item) =>
              item.id === itemId ? { ...item, quantity } : item
            ),
          }));
        }
      },
      // Xóa toàn bộ giỏ hàng
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "spa-shopping-cart", // Tên key trong localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useCartStore;
