from fastapi import APIRouter
from sqlmodel import Session
from typing import List
import uuid

# ==================================================================
# ENDPOINTS CHO SẢN PHẨM (PRODUCT)
# ==================================================================

# dữ liệu giả để lấy toàn bộ sản phẩm
""" export interface Product {
  id: string;
  name: string;
  description: string;
  categories: string[];
  price: number;
  stock: number;
  images: ImageUrl[];
  is_retail: boolean;
  is_consumable: boolean;
  base_unit: string; // vd: "chai", "lọ", "hũ"
  consumable_unit?: string; // vd: "ml", "g"
  conversion_rate?: number; // Tỷ lệ quy đổi (vd: 500ml/chai)
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
} """

product = {
    "id": str(uuid.uuid4()),
    "name": "Sản phẩm mẫu",
    "description": "Mô tả sản phẩm mẫu",
    "categories": ["Chăm sóc da", "Dưỡng ẩm"],
    "price": 150000,
    "stock": 50,
    "images": [
        {
            "url": "https://place-hold.it/300x200",
            "alt": "Hình ảnh sản phẩm mẫu",
            "is_primary": True,
        },
        {
            "url": "https://place-hold.it/300x200",
            "alt": "Hình ảnh phụ sản phẩm mẫu",
            "is_primary": False,
        },
    ],
    "is_retail": True,
    "is_consumable": True,
    "base_unit": "chai",
    "consumable_unit": "ml",
    "conversion_rate": 500,
    "is_deleted": False,
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-10T15:30:00Z",
}

router = APIRouter()


@router.get("/products", response_model=List[str])
def get_all_products(session: Session):
    """Lấy danh sách tất cả sản phẩm."""
    return [product["id"] for _ in range(5)]  # Trả về danh sách ID sản phẩm giả
