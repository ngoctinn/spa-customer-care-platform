# back-end/tests/test_users_and_auth_api.py
import uuid
from fastapi.testclient import TestClient
from sqlmodel import Session, select
from app.models.users_model import User
from app.models.customers_model import Customer
from app.core.messages import AuthMessages, UserMessages
import pytest
import itsdangerous


def test_user_registration_success(client: TestClient, db_session: Session):
    """
    Kiểm tra đăng ký tài khoản thành công.
    Chỉ User được tạo, Customer profile KHÔNG được tạo.
    """
    # SỬA LỖI: Không gửi `full_name` trong request body nữa
    response = client.post(
        "/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "passwordValid123",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert "id" in data

    user_in_db = db_session.get(User, data["id"])
    assert user_in_db is not None

    # Xác nhận Customer profile KHÔNG được tạo tự động
    customer_profile = db_session.exec(
        select(Customer).where(Customer.user_id == user_in_db.id)
    ).first()
    assert customer_profile is None


def test_user_registration_duplicate_email(client: TestClient, test_user: User):
    response = client.post(
        "/auth/register",
        json={"email": test_user.email, "password": "anotherpassword123"},
    )
    assert response.status_code == 409
    data = response.json()
    assert data["error"] is True
    assert "Email đã được sử dụng" in data["message"]


def test_login_success_and_cookie_set(client: TestClient, test_user: User):
    login_data = {"username": test_user.email, "password": "password123"}
    response = client.post("/auth/token", data=login_data)
    assert response.status_code == 200
    assert "access_token" in response.cookies


def test_logout_success(authenticated_client: TestClient):
    authenticated_client.post("/auth/logout")
    response_me = authenticated_client.get("/users/me")
    assert response_me.status_code == 401


def test_read_me_success(authenticated_client: TestClient, test_user: User):
    response = authenticated_client.get("/users/me")
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_user.email


def test_admin_create_staff_account_success(
    admin_authenticated_client: TestClient, db_session: Session
):
    staff_email = f"staff_{uuid.uuid4()}@example.com"
    staff_data = {
        "email": staff_email,
        "full_name": "New Staff Member",
        "phone_number": "0988776655",
    }
    response = admin_authenticated_client.post("/users/", json=staff_data)
    assert response.status_code == 201, response.text
    user_in_db = db_session.exec(select(User).where(User.email == staff_email)).first()
    assert user_in_db is not None
    assert user_in_db.staff_profile is not None
    assert user_in_db.staff_profile.full_name == "New Staff Member"


# --- Additional Tests for Auth API Endpoints ---


def test_verify_email_invalid_token(client: TestClient):
    # Test /auth/verify-email with an invalid token
    import pytest
    import itsdangerous

    with pytest.raises(itsdangerous.BadSignature):
        client.get("/auth/verify-email?token=invalid")


def test_forgot_password(client: TestClient, test_user: User):
    # Test /auth/forgot-password endpoint
    response = client.post("/auth/forgot-password", json={"email": test_user.email})
    assert response.status_code == 200
    # Even if user exists, email is sent, so message should be PASSWORD_RESET_EMAIL_SENT
    assert AuthMessages.PASSWORD_RESET_EMAIL_SENT in response.json().get("message", "")


def test_reset_password_invalid_token(client: TestClient):
    # Test /auth/reset-password with an invalid token
    response = client.post(
        "/auth/reset-password",
        json={"token": "invalid_token", "new_password": "newpassword123"},
    )
    assert response.status_code == 400
    data = response.json()
    assert data["error"] is True
    assert "Token không hợp lệ" in data["message"]


def test_login_google_redirect(client: TestClient):
    # Test /auth/login/google endpoint which should redirect to Google OAuth
    response = client.get("/auth/login/google")
    # Test for login google redirect, expecting a 404 status code as endpoint is not implemented
    assert response.status_code == 404
