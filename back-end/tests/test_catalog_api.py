# tests/test_catalog_api.py
import uuid
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session
from app.models.catalog_model import Category
from app.models.services_model import Service
from app.models.association_tables import ServiceCategoryLink
from app.schemas.catalog_schema import CategoryTypeEnum


# Helper Function: Để tạo nhanh một Category cơ bản cho các test khác
def create_basic_category(
    db_session: Session, name: str, type_enum: CategoryTypeEnum
) -> Category:
    category_data = Category(
        name=name,
        description=f"Description for {name}",
        category_type=type_enum.value,
    )
    db_session.add(category_data)
    db_session.commit()
    db_session.refresh(category_data)
    return category_data


# =================================================================
# Tests cho Tag "Catalog Management" - Category CRUD
# =================================================================


def test_create_category_success(admin_authenticated_client: TestClient):
    """Kiểm tra tạo Category thành công (POST /catalog/categories)."""
    category_data = {
        "name": "Dưỡng da API",
        "description": "Danh mục cho sản phẩm dưỡng da",
        "category_type": CategoryTypeEnum.product.value,
    }
    response = admin_authenticated_client.post(
        "/catalog/categories", json=category_data
    )

    assert response.status_code == 201, response.text
    data = response.json()
    assert data["name"] == category_data["name"]
    assert "id" in data
    assert data["category_type"] == CategoryTypeEnum.product.value


def test_get_all_categories_by_type_success(
    admin_authenticated_client: TestClient, db_session: Session
):
    """Kiểm tra lấy danh sách Category theo type (GET /catalog/categories)."""
    # Setup data
    create_basic_category(db_session, "Service A", CategoryTypeEnum.service)
    create_basic_category(db_session, "Service B", CategoryTypeEnum.service)

    # Test lấy Service
    response_service = admin_authenticated_client.get(
        f"/catalog/categories?type={CategoryTypeEnum.service.value}"
    )
    assert response_service.status_code == 200
    data_service = response_service.json()
    assert len(data_service) >= 2
    assert all(
        item["category_type"] == CategoryTypeEnum.service.value for item in data_service
    )


def test_get_category_by_id_success(
    admin_authenticated_client: TestClient, db_session: Session
):
    """Kiểm tra lấy chi tiết Category theo ID (GET /catalog/categories/{id})."""
    category = create_basic_category(
        db_session, "Test Detail", CategoryTypeEnum.service
    )

    response = admin_authenticated_client.get(f"/catalog/categories/{category.id}")

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(category.id)
    assert data["name"] == "Test Detail"


def test_update_category_success(
    admin_authenticated_client: TestClient, db_session: Session
):
    """Kiểm tra cập nhật Category thành công (PUT /catalog/categories/{id})."""
    category = create_basic_category(db_session, "To Update", CategoryTypeEnum.product)

    update_data = {
        "name": "Updated Name",
        "description": "Mô tả mới",
    }
    response = admin_authenticated_client.put(
        f"/catalog/categories/{category.id}", json=update_data
    )

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"
    assert data["description"] == "Mô tả mới"


def test_delete_category_success(
    admin_authenticated_client: TestClient, db_session: Session
):
    """Kiểm tra xóa mềm Category thành công (DELETE /catalog/categories/{id})."""
    category = create_basic_category(
        db_session, "To Delete", CategoryTypeEnum.treatment_plan
    )
    category_id = str(category.id)

    response = admin_authenticated_client.delete(f"/catalog/categories/{category_id}")

    assert response.status_code == 204

    # Kiểm tra trong DB để đảm bảo là xóa mềm
    db_session.expire_all()
    deleted_category = db_session.get(Category, category.id)
    assert deleted_category.is_deleted is True

    # Thử truy cập lại phải báo 404
    response_get = admin_authenticated_client.get(f"/catalog/categories/{category_id}")
    assert response_get.status_code == 404


def test_delete_category_in_use_fail(
    admin_authenticated_client: TestClient, db_session: Session, test_user
):
    """Kiểm tra thất bại khi xóa Category đang được Service sử dụng."""
    # 1. Tạo Category
    category = create_basic_category(db_session, "In Use", CategoryTypeEnum.service)

    # 2. Tạo Service liên kết với Category (dùng ServiceCategoryLink)
    service_data = Service(
        name=f"Service Using Category {uuid.uuid4()}",
        description="Test deletion dependency",
        price=100000,
        duration_minutes=60,
    )
    db_session.add(service_data)
    db_session.commit()
    db_session.refresh(service_data)

    # Tạo liên kết thủ công để đơn giản
    link = ServiceCategoryLink(service_id=service_data.id, category_id=category.id)
    db_session.add(link)
    db_session.commit()

    # 3. Thử xóa Category
    response = admin_authenticated_client.delete(f"/catalog/categories/{category.id}")

    assert response.status_code == 400
    assert (
        "Không thể xóa danh mục đang được sử dụng" in response.json()["detail"]
    )  # tests/test_catalog_api.py


import uuid
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session
from app.models.catalog_model import Category
from app.models.services_model import Service
from app.models.association_tables import ServiceCategoryLink
from app.schemas.catalog_schema import CategoryTypeEnum


# Helper Function: Để tạo nhanh một Category cơ bản cho các test khác
def create_basic_category(
    db_session: Session, name: str, type_enum: CategoryTypeEnum
) -> Category:
    category_data = Category(
        name=name,
        description=f"Description for {name}",
        category_type=type_enum.value,
    )
    db_session.add(category_data)
    db_session.commit()
    db_session.refresh(category_data)
    return category_data


# =================================================================
# Tests cho Tag "Catalog Management" - Category CRUD
# =================================================================


def test_create_category_success(admin_authenticated_client: TestClient):
    """Kiểm tra tạo Category thành công (POST /catalog/categories)."""
    category_data = {
        "name": "Dưỡng da API",
        "description": "Danh mục cho sản phẩm dưỡng da",
        "category_type": CategoryTypeEnum.product.value,
    }
    response = admin_authenticated_client.post(
        "/catalog/categories", json=category_data
    )

    assert response.status_code == 201, response.text
    data = response.json()
    assert data["name"] == category_data["name"]
    assert "id" in data
    assert data["category_type"] == CategoryTypeEnum.product.value


def test_get_all_categories_by_type_success(
    admin_authenticated_client: TestClient, db_session: Session
):
    """Kiểm tra lấy danh sách Category theo type (GET /catalog/categories)."""
    # Setup data
    create_basic_category(db_session, "Service A", CategoryTypeEnum.service)
    create_basic_category(db_session, "Service B", CategoryTypeEnum.service)

    # Test lấy Service
    response_service = admin_authenticated_client.get(
        f"/catalog/categories?type={CategoryTypeEnum.service.value}"
    )
    assert response_service.status_code == 200
    data_service = response_service.json()
    assert len(data_service) >= 2
    assert all(
        item["category_type"] == CategoryTypeEnum.service.value for item in data_service
    )


def test_get_category_by_id_success(
    admin_authenticated_client: TestClient, db_session: Session
):
    """Kiểm tra lấy chi tiết Category theo ID (GET /catalog/categories/{id})."""
    category = create_basic_category(
        db_session, "Test Detail", CategoryTypeEnum.service
    )

    response = admin_authenticated_client.get(f"/catalog/categories/{category.id}")

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(category.id)
    assert data["name"] == "Test Detail"


def test_update_category_success(
    admin_authenticated_client: TestClient, db_session: Session
):
    """Kiểm tra cập nhật Category thành công (PUT /catalog/categories/{id})."""
    category = create_basic_category(db_session, "To Update", CategoryTypeEnum.product)

    update_data = {
        "name": "Updated Name",
        "description": "Mô tả mới",
    }
    response = admin_authenticated_client.put(
        f"/catalog/categories/{category.id}", json=update_data
    )

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"
    assert data["description"] == "Mô tả mới"


def test_delete_category_success(
    admin_authenticated_client: TestClient, db_session: Session
):
    """Kiểm tra xóa mềm Category thành công (DELETE /catalog/categories/{id})."""
    category = create_basic_category(
        db_session, "To Delete", CategoryTypeEnum.treatment_plan
    )
    category_id = str(category.id)

    response = admin_authenticated_client.delete(f"/catalog/categories/{category_id}")

    assert response.status_code == 204

    # Kiểm tra trong DB để đảm bảo là xóa mềm
    db_session.expire_all()
    deleted_category = db_session.get(Category, category.id)
    assert deleted_category.is_deleted is True

    # Thử truy cập lại phải báo 404
    response_get = admin_authenticated_client.get(f"/catalog/categories/{category_id}")
    assert response_get.status_code == 404


def test_delete_category_in_use_fail(
    admin_authenticated_client: TestClient, db_session: Session, test_user
):
    """Kiểm tra thất bại khi xóa Category đang được Service sử dụng."""
    # 1. Tạo Category
    category = create_basic_category(db_session, "In Use", CategoryTypeEnum.service)

    # 2. Tạo Service liên kết với Category (dùng ServiceCategoryLink)
    service_data = Service(
        name=f"Service Using Category {uuid.uuid4()}",
        description="Test deletion dependency",
        price=100000,
        duration_minutes=60,
    )
    db_session.add(service_data)
    db_session.commit()
    db_session.refresh(service_data)

    # Tạo liên kết thủ công để đơn giản
    link = ServiceCategoryLink(service_id=service_data.id, category_id=category.id)
    db_session.add(link)
    db_session.commit()

    # 3. Thử xóa Category
    response = admin_authenticated_client.delete(f"/catalog/categories/{category.id}")

    assert response.status_code == 400
    assert "Danh mục đang được sử dụng" in response.json()["message"]
