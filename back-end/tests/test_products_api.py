# back-end/tests/test_products_api.py
import uuid
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.models.catalog_model import Category
from app.schemas.catalog_schema import CategoryTypeEnum
from app.core.messages import ProductMessages


def test_create_product_success(client: TestClient, db_session: Session):
    """
    Kiểm tra việc tạo sản phẩm thành công.
    """
    # Bước 1: Chuẩn bị dữ liệu cần thiết (tạo một category cho sản phẩm)
    category_data = Category(
        name="Dưỡng da",
        description="Sản phẩm dưỡng da",
        category_type=CategoryTypeEnum.product,
    )
    db_session.add(category_data)
    db_session.commit()
    db_session.refresh(category_data)

    # Bước 2: Định nghĩa dữ liệu đầu vào cho API
    product_data = {
        "name": "Serum cấp ẩm B5",
        "description": "Serum phục hồi và cấp ẩm cho da",
        "price": 550000,
        "stock": 100,
        "is_retail": True,
        "is_consumable": False,
        "base_unit": "chai",
        "category_ids": [str(category_data.id)],  # Chuyển UUID thành string
        "existing_image_ids": [],
        "primary_image_id": None,
    }

    # Bước 3: Gọi API endpoint
    response = client.post("/products", json=product_data)

    # Bước 4: Kiểm tra kết quả
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["name"] == product_data["name"]
    assert data["price"] == product_data["price"]
    assert data["description"] == product_data["description"]
    assert "id" in data
    assert len(data["categories"]) == 1
    assert data["categories"][0]["name"] == "Dưỡng da"


def test_create_product_with_non_existent_category(
    client: TestClient, db_session: Session
):
    """
    Kiểm tra lỗi khi tạo sản phẩm với category không tồn tại.
    """
    non_existent_uuid = str(uuid.uuid4())
    product_data = {
        "name": "Sản phẩm lỗi",
        "description": "Test lỗi",
        "price": 10000,
        "stock": 10,
        "is_retail": True,
        "base_unit": "cái",
        "category_ids": [non_existent_uuid],
    }

    response = client.post("/products", json=product_data)

    # Service của bạn sẽ raise lỗi 404 khi không tìm thấy category
    assert response.status_code == 404
    data = response.json()
    assert "Không tìm thấy danh mục" in data["message"]
