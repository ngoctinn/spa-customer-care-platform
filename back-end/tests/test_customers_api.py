# back-end/tests/test_customers_api.py

import uuid
from fastapi.testclient import TestClient
from sqlmodel import Session
from app.models.users_model import User
from app.models.customers_model import Customer

# =================================================================
# Tests cho luồng quản lý của Admin
# =================================================================


def test_admin_create_offline_customer(admin_authenticated_client: TestClient):
    """Kiểm tra admin tạo khách hàng vãng lai thành công."""
    customer_data = {
        "phone_number": "0905123456",
        "full_name": "Nguyễn Văn A",
        "email": "nguyenvana@example.com",
    }
    response = admin_authenticated_client.post("/customers", json=customer_data)
    assert response.status_code == 201
    data = response.json()
    assert data["phone_number"] == customer_data["phone_number"]
    assert data["full_name"] == customer_data["full_name"]
    assert "id" in data


def test_admin_get_all_customers(
    admin_authenticated_client: TestClient, offline_customer: Customer
):
    """Kiểm tra admin lấy được danh sách tất cả khách hàng."""
    response = admin_authenticated_client.get("/customers")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1  # Phải có ít nhất customer từ fixture


def test_admin_get_customer_by_id(
    admin_authenticated_client: TestClient, offline_customer: Customer
):
    """Kiểm tra admin lấy thông tin chi tiết một khách hàng."""
    customer_id = str(offline_customer.id)
    response = admin_authenticated_client.get(f"/customers/{customer_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == customer_id
    assert data["phone_number"] == offline_customer.phone_number


def test_admin_update_customer(
    admin_authenticated_client: TestClient, offline_customer: Customer
):
    """Kiểm tra admin cập nhật thông tin khách hàng."""
    customer_id = str(offline_customer.id)
    update_data = {"full_name": "Trần Thị B", "address": "123 Đường ABC"}
    response = admin_authenticated_client.put(
        f"/customers/{customer_id}", json=update_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == update_data["full_name"]
    assert data["address"] == update_data["address"]


def test_admin_delete_customer(
    admin_authenticated_client: TestClient,
    offline_customer: Customer,
    db_session: Session,
):
    """Kiểm tra admin xóa (mềm) một khách hàng."""
    customer_id = str(offline_customer.id)
    response = admin_authenticated_client.delete(f"/customers/{customer_id}")
    assert response.status_code == 204  # No Content

    # Kiểm tra trong DB để đảm bảo is_deleted = True
    db_session.expire_all()
    deleted_customer = db_session.get(Customer, offline_customer.id)
    assert deleted_customer.is_deleted is True


# =================================================================
# Tests cho luồng tự quản lý của User
# =================================================================


def test_user_update_own_profile(
    authenticated_client: TestClient, customer_profile_for_test_user: Customer
):
    """Kiểm tra user đã đăng nhập tự cập nhật hồ sơ thành công."""
    update_data = {"full_name": "Test User Updated", "gender": "Nam"}
    response = authenticated_client.put("/customers/me/profile", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == update_data["full_name"]
    assert data["gender"] == update_data["gender"]
    assert data["id"] == str(customer_profile_for_test_user.id)


def test_user_update_profile_not_exist(authenticated_client: TestClient):
    """
    Kiểm tra lỗi 404 khi user chưa có hồ sơ khách hàng mà cố gắng cập nhật.
    (Fixture `authenticated_client` tạo ra `test_user` nhưng chưa có profile)
    """
    update_data = {"full_name": "A new name"}
    response = authenticated_client.put("/customers/me/profile", json=update_data)
    assert response.status_code == 404
    assert "Không tìm thấy hồ sơ khách hàng" in response.json()["detail"]


# =================================================================
# Tests phân quyền
# =================================================================


def test_normal_user_cannot_access_admin_customer_endpoints(
    authenticated_client: TestClient, offline_customer: Customer
):
    """Kiểm tra user thường không thể truy cập các API quản lý khách hàng."""
    customer_id = str(offline_customer.id)

    # Thử lấy danh sách
    response_get_all = authenticated_client.get("/customers")
    assert response_get_all.status_code == 403  # Endpoint này yêu cầu quyền admin

    # Thử xóa
    response_delete = authenticated_client.delete(f"/customers/{customer_id}")
    assert response_delete.status_code == 403  # Endpoint này yêu cầu quyền admin
