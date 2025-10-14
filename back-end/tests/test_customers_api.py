# tests/test_customers_api.py
import uuid
from fastapi.testclient import TestClient
from sqlmodel import Session, select
from app.models.users_model import User
from app.models.customers_model import Customer
from app.core.messages import CustomerMessages

# =================================================================
# Tests for Authenticated User (Regular User)
# =================================================================


def test_user_creates_profile_on_first_update(
    authenticated_client: TestClient, test_user: User, db_session: Session
):
    """
    Kiểm tra người dùng tạo hồ sơ thành công trong lần đầu tiên cập nhật.
    """
    update_data = {
        "full_name": "Test User First Create",
        "gender": "Nữ",
        "phone_number": "0909090909",
        "address": "123 Đường ABC, Quận 1, TP. HCM",
    }
    response = authenticated_client.put("/customers/me/profile", json=update_data)
    assert response.status_code == 200, response.text

    db_session.expire_all()

    created_profile = db_session.exec(
        select(Customer).where(Customer.user_id == test_user.id)
    ).first()
    assert created_profile is not None
    assert created_profile.full_name == "Test User First Create"
    assert created_profile.phone_number == "0909090909"
    assert created_profile.address == "123 Đường ABC, Quận 1, TP. HCM"


def test_user_fails_to_create_profile_without_phone(
    authenticated_client: TestClient, test_user: User
):
    """
    Kiểm tra lỗi khi người dùng tạo hồ sơ lần đầu nhưng thiếu số điện thoại.
    """
    update_data = {"full_name": "A User Without Phone"}
    response = authenticated_client.put("/customers/me/profile", json=update_data)
    assert response.status_code == 422
    # SỬA LỖI 1: Truy cập đúng cấu trúc của thông báo lỗi validation
    assert "Số điện thoại là bắt buộc" in response.json()["detail"]


def test_user_update_own_existing_profile(
    authenticated_client: TestClient, customer_profile_for_test_user: Customer
):
    """
    Kiểm tra người dùng cập nhật thành công hồ sơ đã có của mình.
    """
    update_data = {
        "full_name": "Test User Updated Name",
        "gender": "Nam",
    }
    response = authenticated_client.put("/customers/me/profile", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "Test User Updated Name"
    assert data["gender"] == "Nam"


def test_user_cannot_update_phone_number_to_duplicate(
    authenticated_client: TestClient,
    customer_profile_for_test_user: Customer,
    offline_customer: Customer,
):
    """
    Kiểm tra người dùng không thể cập nhật SĐT trùng với SĐT của khách hàng khác.
    """
    update_data = {"phone_number": offline_customer.phone_number}
    response = authenticated_client.put("/customers/me/profile", json=update_data)
    assert response.status_code == 400
    assert "Số điện thoại đã tồn tại" in response.json()["detail"]


def test_user_can_clear_optional_fields(
    authenticated_client: TestClient, customer_profile_for_test_user: Customer
):
    """
    Kiểm tra người dùng có thể xóa (cập nhật thành null) các trường tùy chọn.
    """
    update_data = {"address": None, "note": "Ghi chú mới"}
    response = authenticated_client.put("/customers/me/profile", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["address"] is None
    assert data["note"] == "Ghi chú mới"


def test_new_user_can_claim_existing_offline_profile(
    authenticated_client: TestClient,
    test_user: User,
    offline_customer: Customer,
    db_session: Session,
):
    """
    Kiểm tra người dùng mới có thể "nhận" một hồ sơ khách hàng vãng lai.
    """
    assert offline_customer.user_id is None
    update_data = {
        "phone_number": offline_customer.phone_number,
        "full_name": "Claimed Name",
    }

    response = authenticated_client.put("/customers/me/profile", json=update_data)
    assert response.status_code == 200, response.text

    data = response.json()
    assert data["id"] == str(offline_customer.id)
    assert data["user"]["id"] == str(test_user.id)
    assert data["full_name"] == "Claimed Name"

    db_session.expire_all()
    claimed_profile = db_session.get(Customer, offline_customer.id)
    assert claimed_profile.user_id == test_user.id
    assert claimed_profile.full_name == "Claimed Name"


# SỬA LỖI 2: Sử dụng fixture `another_user_profile` thay vì `customer_profile_for_test_user`
def test_new_user_cannot_claim_profile_already_linked(
    authenticated_client: TestClient,
    another_user_profile: Customer,
):
    """
    Kiểm tra người dùng mới không thể nhận hồ sơ đã được liên kết với tài khoản khác.
    """
    update_data = {
        "phone_number": another_user_profile.phone_number,
    }
    response = authenticated_client.put("/customers/me/profile", json=update_data)
    assert response.status_code == 400
    assert "Số điện thoại đã được liên kết" in response.json()["detail"]


def test_update_profile_fails_with_invalid_phone_format(
    authenticated_client: TestClient,
):
    """Kiểm tra lỗi 422 khi cập nhật SĐT với định dạng không hợp lệ."""
    update_data = {
        "phone_number": "12345",
    }
    response = authenticated_client.put("/customers/me/profile", json=update_data)
    assert response.status_code == 422


# =================================================================
# Tests for Admin User
# =================================================================


def test_admin_create_offline_customer_success(admin_authenticated_client: TestClient):
    """
    Kiểm tra admin tạo khách hàng vãng lai thành công.
    """
    phone_number = f"0905{str(uuid.uuid4().int)[:6]}"
    customer_data = {
        "phone_number": phone_number,
        "full_name": "Nguyễn Văn A",
    }
    response = admin_authenticated_client.post("/customers", json=customer_data)
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["phone_number"] == customer_data["phone_number"]
    assert data["full_name"] == customer_data["full_name"]
    assert data["user"] is None


# SỬA LỖI 3: Tạo SĐT hợp lệ chỉ bằng số.
def test_admin_find_or_create_updates_name_if_missing(
    admin_authenticated_client: TestClient, db_session: Session
):
    """
    Kiểm tra khi admin "tạo" một khách hàng với SĐT đã tồn tại nhưng
    khách hàng cũ chưa có tên, tên mới sẽ được cập nhật.
    """
    phone = f"0906{str(uuid.uuid4().int)[:6]}"
    customer_no_name = Customer(phone_number=phone)
    db_session.add(customer_no_name)
    db_session.commit()
    db_session.refresh(customer_no_name)

    customer_data = {"phone_number": phone, "full_name": "Tên Mới Được Bổ Sung"}
    response = admin_authenticated_client.post("/customers", json=customer_data)

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(customer_no_name.id)
    assert data["full_name"] == "Tên Mới Được Bổ Sung"


def test_admin_get_all_customers(
    admin_authenticated_client: TestClient,
    customer_profile_for_test_user: Customer,
    offline_customer: Customer,
):
    """
    Kiểm tra admin lấy được danh sách tất cả khách hàng.
    """
    response = admin_authenticated_client.get("/customers")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 2
    ids = {item["id"] for item in data}
    assert str(customer_profile_for_test_user.id) in ids
    assert str(offline_customer.id) in ids


def test_admin_get_customer_by_id(
    admin_authenticated_client: TestClient, offline_customer: Customer
):
    """
    Kiểm tra admin lấy thông tin chi tiết khách hàng theo ID.
    """
    response = admin_authenticated_client.get(f"/customers/{offline_customer.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(offline_customer.id)


def test_admin_get_non_existent_customer_by_id(admin_authenticated_client: TestClient):
    """
    Kiểm tra lỗi 404 khi lấy khách hàng với ID không tồn tại.
    """
    non_existent_id = uuid.uuid4()
    response = admin_authenticated_client.get(f"/customers/{non_existent_id}")
    assert response.status_code == 404


def test_admin_update_customer(
    admin_authenticated_client: TestClient,
    offline_customer: Customer,
    db_session: Session,
):
    """
    Kiểm tra admin cập nhật thông tin khách hàng thành công.
    """
    update_data = {
        "full_name": "Khách vãng lai đã cập nhật",
    }
    response = admin_authenticated_client.put(
        f"/customers/{offline_customer.id}", json=update_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "Khách vãng lai đã cập nhật"

    db_session.expire_all()
    updated_customer = db_session.get(Customer, offline_customer.id)
    assert updated_customer.full_name == "Khách vãng lai đã cập nhật"


def test_admin_delete_customer(
    admin_authenticated_client: TestClient,
    db_session: Session,
):
    """
    Kiểm tra admin xóa mềm khách hàng thành công.
    """
    customer_to_delete = Customer(
        full_name="Customer to Delete", phone_number=f"0901{uuid.uuid4().hex[:6]}"
    )
    db_session.add(customer_to_delete)
    db_session.commit()
    db_session.refresh(customer_to_delete)
    customer_id = str(customer_to_delete.id)

    response = admin_authenticated_client.delete(f"/customers/{customer_id}")
    assert response.status_code == 204

    db_session.expire_all()
    deleted_customer = db_session.get(Customer, customer_id)
    assert deleted_customer.is_deleted is True

    response_get = admin_authenticated_client.get(f"/customers/{customer_id}")
    assert response_get.status_code == 404


# =================================================================
# Tests for Access Control
# =================================================================


def test_normal_user_cannot_access_admin_customer_endpoints(
    authenticated_client: TestClient, offline_customer: Customer
):
    """
    Kiểm tra người dùng thường không thể truy cập các endpoint của admin.
    """
    response_get_all = authenticated_client.get("/customers")
    assert response_get_all.status_code == 403

    response_get_by_id = authenticated_client.get(f"/customers/{offline_customer.id}")
    assert response_get_by_id.status_code == 403

    response_post = authenticated_client.post(
        "/customers", json={"phone_number": "0901112233"}
    )
    assert response_post.status_code == 403

    response_put = authenticated_client.put(
        f"/customers/{offline_customer.id}", json={"full_name": "test"}
    )
    assert response_put.status_code == 403

    response_delete = authenticated_client.delete(f"/customers/{offline_customer.id}")
    assert response_delete.status_code == 403
