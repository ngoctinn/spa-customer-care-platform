# app/api/products_api.py
import uuid
from typing import List
from fastapi import APIRouter

# THAY ĐỔI: Import schema mới
from app.schemas.products_schema import ProductPublicWithDetails

router = APIRouter()

# Dữ liệu giả được cấu trúc theo schema ProductPublicWithDetails
mock_product_category = {
    "id": str(uuid.uuid4()),
    "name": "Sản phẩm Dưỡng da",
    "description": "Các sản phẩm chăm sóc và dưỡng da chuyên sâu.",
    "category_type": "product",
}

mock_products_data = [
    {
        "id": str(uuid.uuid4()),
        "name": "Kem chống nắng SPF 50+",
        "description": "Kem chống nắng vật lý lai hóa học, bảo vệ da toàn diện.",
        "price": 550000,
        "stock": 100,
        "is_retail": True,
        "is_consumable": False,
        "base_unit": "tuýp",
        "category_id": mock_product_category["id"],
        "category": mock_product_category,
        "images": [
            {
                "id": str(uuid.uuid4()),
                "url": "https://place-hold.it/300x300/a8dadc/457b9d?text=KemChongNang",
                "alt_text": "Hình ảnh Kem chống nắng",
                "is_primary": True,
            }
        ],
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Serum cấp ẩm Hyaluronic Acid",
        "description": "Serum chứa HA đa phân tử giúp cấp ẩm sâu cho da.",
        "price": 720000,
        "stock": 75,
        "is_retail": True,
        "is_consumable": True,
        "base_unit": "chai",
        "consumable_unit": "ml",
        "conversion_rate": 30,
        "category_id": mock_product_category["id"],
        "category": mock_product_category,
        "images": [
            {
                "id": str(uuid.uuid4()),
                "url": "https://place-hold.it/300x300/f1faee/1d3557?text=SerumHA",
                "alt_text": "Hình ảnh Serum HA",
                "is_primary": True,
            }
        ],
    },
]


@router.get("", response_model=List[ProductPublicWithDetails])
def get_all_products():
    """Lấy danh sách tất cả sản phẩm (dữ liệu mô phỏng)."""
    return mock_products_data
