// src/features/checkout/stores/pos-store.ts
import { create } from "zustand";
import { FullCustomerProfile } from "@/features/customer/types";
import React from "react";

// Mở rộng CartItem để chứa appointment_id
export interface PosCartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: "product" | "service" | "treatment";
  imageUrl: string;
  appointment_id?: string | null;
}

interface PosState {
  customer: FullCustomerProfile | null;
  items: PosCartItem[];
  appointmentId: string | null;
  total: number;
  receiptRef: React.RefObject<HTMLDivElement | null>;
  setCustomer: (customer: FullCustomerProfile | null) => void;
  addItem: (
    item: Omit<PosCartItem, "imageUrl"> & { imageUrl?: string }
  ) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  setAppointmentId: (id: string | null) => void;
  clear: () => void;
}

const calculateTotal = (items: PosCartItem[]) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);

export const usePosStore = create<PosState>((set) => ({
  customer: null,
  items: [],
  appointmentId: null,
  total: 0,
  receiptRef: React.createRef<HTMLDivElement>(),
  setCustomer: (customer) => set({ customer }),
  addItem: (itemToAdd) =>
    set((state) => {
      const existingItem = state.items.find((item) => item.id === itemToAdd.id);
      let newItems;
      if (existingItem) {
        newItems = state.items.map((item) =>
          item.id === itemToAdd.id
            ? { ...item, quantity: item.quantity + itemToAdd.quantity }
            : item
        );
      } else {
        newItems = [
          ...state.items,
          { ...itemToAdd, imageUrl: itemToAdd.imageUrl || "" },
        ];
      }
      return { items: newItems, total: calculateTotal(newItems) };
    }),
  removeItem: (itemId) =>
    set((state) => {
      const newItems = state.items.filter((item) => item.id !== itemId);
      return { items: newItems, total: calculateTotal(newItems) };
    }),
  updateQuantity: (itemId, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        const newItems = state.items.filter((item) => item.id !== itemId);
        return { items: newItems, total: calculateTotal(newItems) };
      }
      const newItems = state.items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      );
      return { items: newItems, total: calculateTotal(newItems) };
    }),
  setAppointmentId: (id) => set({ appointmentId: id }),
  clear: () =>
    set({
      customer: null,
      items: [],
      appointmentId: null,
      total: 0,
    }),
}));
