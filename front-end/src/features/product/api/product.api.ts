import { Product } from "@/features/product/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${API_URL}/products`);
  if (!response.ok) {
    throw new Error("Không thể tải danh sách sản phẩm");
  }
  return response.json();
}
