# tests/test_services_api.py
import uuid
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.models.catalog_model import Category
from app.models.services_model import Service
from app.schemas.catalog_schema import CategoryTypeEnum
from app.services.services_service import services_service
from app.core.messages import ServiceMessages


# --- Fixtures cho Service Tests ---


@pytest.fixture(scope="function")
def service_category_fixture(db_session: Session) -> Category:
    """Fixture tạo Category loại 'service'."""
    category_data = Category(
        name=f"Dịch vụ Test {uuid.uuid4()}",
        description="Category cho test service",
        category_type=CategoryTypeEnum.service.value,
    )
    db_session.add(category_data)
    db_session.commit()
    db_session.refresh(category_data)
    return category_data


@pytest.fixture(scope="function")
def basic_service_fixture(
    db_session: Session, service_category_fixture: Category
) -> Service:
    """Fixture tạo một Service cơ bản đã liên kết Category."""
    db_service = Service(
        name=f"Dịch vụ Test {uuid.uuid4()}",
        description="Mô tả test",
        price=100000.0,
        duration_minutes=60,
    )
    db_service.categories.append(service_category_fixture)
    db_session.add(db_service)
    db_session.commit()
    db_session.refresh(db_service)
    return db_service


# =================================================================
# Tests cho Tag "Services" - Service CRUD
# =================================================================


def test_create_service_success(
    admin_authenticated_client: TestClient, service_category_fixture: Category
):
    """Kiểm tra tạo Service thành công (POST /services)."""
    service_data = {
        "name": f"Dịch vụ massage {uuid.uuid4()}",
        "description": "Giảm căng thẳng vùng cổ vai",
        "price": 350000.0,
        "duration_minutes": 45,
        "category_ids": [str(service_category_fixture.id)],
        # Các trường tùy chọn khác
        "preparation_notes": "Uống đủ nước trước 1h",
    }
    response = admin_authenticated_client.post("/services", json=service_data)

    assert response.status_code == 201, response.text
    data = response.json()
    assert data["name"] == service_data["name"]
    assert data["price"] == service_data["price"]
    assert data["preparation_notes"] == service_data["preparation_notes"]
    assert len(data["categories"]) == 1


def test_get_all_services_success(
    admin_authenticated_client: TestClient, basic_service_fixture: Service
):
    """Kiểm tra lấy danh sách tất cả Services (GET /services)."""
    response = admin_authenticated_client.get("/services")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert any(item["id"] == str(basic_service_fixture.id) for item in data)


def test_get_service_by_id_success(
    admin_authenticated_client: TestClient, basic_service_fixture: Service
):
    """Kiểm tra lấy chi tiết Service theo ID (GET /services/{id})."""
    service_id = str(basic_service_fixture.id)
    response = admin_authenticated_client.get(f"/services/{service_id}")

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == service_id
    assert data["name"] == basic_service_fixture.name
    assert len(data["categories"]) > 0
    assert "images" in data


def test_update_service_success(
    admin_authenticated_client: TestClient,
    db_session: Session,
    basic_service_fixture: Service,
):
    """Kiểm tra cập nhật Service thành công (PUT /services/{id})."""
    service_id = str(basic_service_fixture.id)
    update_data = {
        "price": 150000.0,
        "aftercare_instructions": "Tránh nắng trực tiếp trong 24h.",
    }
    response = admin_authenticated_client.put(
        f"/services/{service_id}", json=update_data
    )

    assert response.status_code == 200
    data = response.json()
    assert data["price"] == update_data["price"]
    assert data["aftercare_instructions"] == update_data["aftercare_instructions"]

    # Kiểm tra trong DB để xác nhận giá trị được cập nhật
    db_session.expire_all()
    updated_service = db_session.get(Service, basic_service_fixture.id)
    assert updated_service.price == 150000.0


def test_delete_service_success(
    admin_authenticated_client: TestClient,
    db_session: Session,
    service_category_fixture: Category,
):
    """Kiểm tra xóa mềm Service thành công (DELETE /services/{id})."""
    # 1. Tạo một service mới để xóa
    service_to_delete = Service(
        name=f"Service To Delete {uuid.uuid4()}",
        description="Mô tả",
        price=1.0,
        duration_minutes=1,
    )
    service_to_delete.categories.append(service_category_fixture)
    db_session.add(service_to_delete)
    db_session.commit()
    db_session.refresh(service_to_delete)

    service_id = str(service_to_delete.id)

    # 2. Gọi API xóa
    response = admin_authenticated_client.delete(f"/services/{service_id}")

    assert response.status_code == 204

    # 3. Kiểm tra trong DB (xóa mềm)
    db_session.expire_all()
    deleted_service = db_session.get(Service, service_to_delete.id)
    assert deleted_service.is_deleted is True

    # 4. Thử truy cập lại phải báo 404
    response_get = admin_authenticated_client.get(f"/services/{service_id}")
    assert response_get.status_code == 404
