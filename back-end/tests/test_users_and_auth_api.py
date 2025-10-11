# back-end/tests/test_users_and_auth_api.py

from fastapi.testclient import TestClient
from sqlmodel import Session
from app.models.users_model import User

# =================================================================
# Tests cho Tag "Authentication"
# =================================================================


def test_user_registration_success(client: TestClient, db_session: Session):
    """Kiểm tra đăng ký tài khoản thành công."""
    response = client.post(
        "/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "passwordValid123",  # Sửa: mật khẩu hợp lệ
            "full_name": "New User",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["full_name"] == "New User"
    assert data["is_active"] is True
    assert "id" in data

    user_in_db = db_session.get(User, data["id"])
    assert user_in_db is not None


def test_user_registration_duplicate_email(client: TestClient, test_user: User):
    """Kiểm tra lỗi khi đăng ký với email đã tồn tại."""
    response = client.post(
        "/auth/register",
        json={
            "email": test_user.email,
            "password": "anotherpassword123",  # Sửa: mật khẩu hợp lệ
            "full_name": "Another User",
        },
    )
    # SỬA LỖI 1: Mong đợi 400 thay vì 422, vì service trả về 400
    assert response.status_code == 400
    assert "Email đã được sử dụng" in response.json()["detail"]


def test_login_success_and_cookie_set(client: TestClient, test_user: User):
    """Kiểm tra đăng nhập thành công và cookie 'access_token' được thiết lập."""
    login_data = {"username": test_user.email, "password": "password123"}
    response = client.post("/auth/token", data=login_data)

    assert response.status_code == 200
    assert response.json() == {"message": "Login successful"}
    assert "access_token" in response.cookies
    # SỬA LỖI 2: Kiểm tra sự tồn tại của chuỗi "Bearer "
    assert "Bearer " in response.cookies["access_token"]


def test_login_wrong_password(client: TestClient, test_user: User):
    """Kiểm tra đăng nhập thất bại với sai mật khẩu."""
    login_data = {"username": test_user.email, "password": "wrongpassword"}
    response = client.post("/auth/token", data=login_data)
    assert response.status_code == 401
    assert "Sai email hoặc mật khẩu" in response.json()["detail"]


def test_logout_success(authenticated_client: TestClient):
    """
    Kiểm tra đăng xuất thành công.
    Sau khi logout, việc truy cập endpoint yêu cầu xác thực phải thất bại.
    """
    # Bước 1: Gọi API logout
    response_logout = authenticated_client.post("/auth/logout")
    assert response_logout.status_code == 200

    # Bước 2: Thử truy cập một trang yêu cầu đăng nhập (protected route)
    response_me = authenticated_client.get("/users/me")

    # Bước 3: Kiểm tra rằng yêu cầu này thất bại với lỗi 401
    assert response_me.status_code == 401
    assert "Chưa đăng nhập" in response_me.json()["detail"]


# =================================================================
# Tests cho Tag "Users"
# =================================================================


def test_read_me_success(authenticated_client: TestClient, test_user: User):
    """Kiểm tra user thường có thể lấy thông tin của chính mình."""
    response = authenticated_client.get("/users/me")
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_user.email
    assert data["id"] == str(test_user.id)
    assert "roles" in data


def test_read_me_unauthenticated(client: TestClient):
    """Kiểm tra lỗi khi chưa đăng nhập mà gọi /users/me."""
    response = client.get("/users/me")
    assert response.status_code == 401
    assert "Chưa đăng nhập" in response.json()["detail"]


def test_admin_can_get_all_users(
    admin_authenticated_client: TestClient, test_user: User
):
    """Kiểm tra admin có thể lấy danh sách tất cả user."""
    # SỬA LỖI 3: Thêm fixture `test_user` để đảm bảo có 2 user trong DB
    response = admin_authenticated_client.get("/users/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 2


def test_normal_user_cannot_get_all_users(authenticated_client: TestClient):
    """Kiểm tra user thường không thể lấy danh sách user."""
    response = authenticated_client.get("/users/")
    assert response.status_code == 403
    assert "Yêu cầu quyền quản trị viên" in response.json()["detail"]


def test_admin_can_delete_user(
    admin_authenticated_client: TestClient, test_user: User, db_session: Session
):
    """Kiểm tra admin có thể xóa (mềm) một user khác."""
    user_id_to_delete = str(test_user.id)
    response = admin_authenticated_client.delete(f"/users/{user_id_to_delete}")

    # SỬA LỖI 4: Endpoint delete trả về UserPublic, đã được sửa để có is_deleted
    assert response.status_code == 200
    data = response.json()
    assert data["is_deleted"] is True
    assert data["is_active"] is False

    # Kiểm tra lại trong DB để chắc chắn
    db_session.expire_all()  # Xóa cache của session để đọc lại từ DB
    deleted_user_in_db = db_session.get(User, test_user.id)
    assert deleted_user_in_db.is_deleted is True
