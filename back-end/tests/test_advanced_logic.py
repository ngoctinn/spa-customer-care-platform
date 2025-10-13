# tests/test_advanced_logic.py
import uuid
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app.models.users_model import User, Role
from app.models.services_model import Service

# SỬA LỖI: Import schema mới
from app.schemas.users_schema import AdminCreateStaffRequest
from app.services import users_service
from app.models.catalog_model import Category

# =================================================================
# TESTS CHO TÍNH NGUYÊN TỬ CỦA GIAO TÁC (TRANSACTION ATOMICITY)
# =================================================================


def test_create_user_by_admin_rollback_on_failure(
    db_session: Session, admin_authenticated_client: TestClient
):
    """
    Kiểm tra rollback: Khi tạo tài khoản nhân viên với role_id không tồn tại,
    cả User và StaffProfile đều không được tạo ra trong CSDL.
    """
    # 1. Đếm số lượng user trước khi thực hiện
    initial_user_count = len(db_session.exec(select(User)).all())

    # 2. Tạo dữ liệu đầu vào với một role_id không tồn tại
    non_existent_role_id = str(uuid.uuid4())
    user_data = {
        "email": f"test_rollback_{uuid.uuid4()}@example.com",
        "full_name": "Rollback User",
        "phone_number": "0901234567",  # Thêm phone_number theo schema mới
        "role_id": non_existent_role_id,
    }

    # 3. Gọi API, mong đợi lỗi 404 vì không tìm thấy role
    # SỬA LỖI: Endpoint vẫn là /users/ theo users_api.py
    response = admin_authenticated_client.post("/users/", json=user_data)
    assert response.status_code == 404
    assert "không được tìm thấy" in response.json()["detail"]

    # 4. Quan trọng nhất: Kiểm tra lại CSDL để đảm bảo không có user nào được tạo
    final_user_count = len(db_session.exec(select(User)).all())
    assert final_user_count == initial_user_count

    # 5. Kiểm tra chắc chắn rằng email đó không tồn tại
    user_in_db = db_session.exec(
        select(User).where(User.email == user_data["email"])
    ).first()
    assert user_in_db is None


# =================================================================
# TESTS CHO CÁC TÌNH HUỐNG PHỨC TẠP VÀ EDGE CASES
# =================================================================


def test_update_service_change_price_and_categories(
    admin_authenticated_client: TestClient,
    db_session: Session,
    basic_service_fixture: Service,
    service_category_fixture: Category,
):
    """
    Kiểm tra cập nhật đồng thời nhiều thuộc tính của Service,
    bao gồm cả mối quan hệ many-to-many (categories).
    """
    # 1. Tạo thêm một category mới để gán vào service
    new_category = Category(
        name=f"Category mới {uuid.uuid4()}",
        description="Category mới cho test",
        category_type="service",
    )
    db_session.add(new_category)
    db_session.commit()
    db_session.refresh(new_category)

    service_id = str(basic_service_fixture.id)
    update_data = {
        "price": 999999.0,
        "description": "Mô tả đã được cập nhật hoàn toàn",
        "category_ids": [str(new_category.id)],
    }

    # 2. Gọi API update
    response = admin_authenticated_client.put(
        f"/services/{service_id}", json=update_data
    )
    assert response.status_code == 200, response.text
    data = response.json()

    # 3. Kiểm tra các giá trị đã được cập nhật
    assert data["price"] == 999999.0
    assert data["description"] == "Mô tả đã được cập nhật hoàn toàn"
    assert len(data["categories"]) == 1
    assert data["categories"][0]["id"] == str(new_category.id)
    assert data["categories"][0]["name"] == new_category.name

    # 4. Kiểm tra lại trực tiếp trong DB
    db_session.expire_all()
    updated_service = db_session.get(Service, basic_service_fixture.id)
    assert updated_service.price == 999999.0
    assert len(updated_service.categories) == 1
    assert updated_service.categories[0].id == new_category.id


def test_get_soft_deleted_object_returns_404(
    admin_authenticated_client: TestClient,
    db_session: Session,
    basic_service_fixture: Service,
):
    """
    Kiểm tra rằng sau khi một đối tượng bị xóa mềm, API get by ID sẽ trả về 404.
    """
    service_id = str(basic_service_fixture.id)

    # 1. Xóa mềm đối tượng
    response_delete = admin_authenticated_client.delete(f"/services/{service_id}")
    assert response_delete.status_code == 204

    # 2. Thử lấy lại đối tượng đó
    response_get = admin_authenticated_client.get(f"/services/{service_id}")
    assert response_get.status_code == 404
    assert "Không tìm thấy" in response_get.json()["detail"]
