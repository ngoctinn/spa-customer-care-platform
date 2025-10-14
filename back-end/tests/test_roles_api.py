# tests/test_roles_api.py
import uuid
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.models.users_model import User, Role


# =================================================================
# Tests cho Tag "Roles & Permissions" - Role Management
# =================================================================


@pytest.fixture(scope="function")
def basic_role_fixture(db_session: Session) -> Role:
    """Fixture tạo một Role cơ bản."""
    role_data = Role(
        name=f"Test Role {uuid.uuid4()}",
        description="Role for testing",
    )
    db_session.add(role_data)
    db_session.commit()
    db_session.refresh(role_data)
    return role_data


def test_create_role_success(admin_authenticated_client: TestClient):
    """Kiểm tra tạo role thành công."""
    role_data = {
        "name": "Test Role",
        "description": "Role for testing purposes",
    }

    response = admin_authenticated_client.post("/admin/roles", json=role_data)

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == role_data["name"]
    assert data["description"] == role_data["description"]
    assert "id" in data


def test_get_all_roles_success(admin_authenticated_client: TestClient):
    """Kiểm tra lấy danh sách roles thành công."""
    response = admin_authenticated_client.get("/admin/roles")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    # Kiểm tra có ít nhất một role (admin role)
    assert len(data) >= 1


def test_get_role_details_success(
    admin_authenticated_client: TestClient, basic_role_fixture: Role
):
    """Kiểm tra lấy chi tiết role thành công."""
    role_id = str(basic_role_fixture.id)

    response = admin_authenticated_client.get(f"/admin/roles/{role_id}")

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == role_id
    assert data["name"] == basic_role_fixture.name


def test_update_role_success(
    admin_authenticated_client: TestClient, basic_role_fixture: Role
):
    """Kiểm tra cập nhật role thành công."""
    role_id = str(basic_role_fixture.id)

    update_data = {
        "name": "Updated Role Name",
        "description": "Updated description",
    }

    response = admin_authenticated_client.put(
        f"/admin/roles/{role_id}", json=update_data
    )

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == update_data["name"]
    assert data["description"] == update_data["description"]


def test_delete_role_success(
    admin_authenticated_client: TestClient, basic_role_fixture: Role
):
    """Kiểm tra xóa role thành công."""
    role_id = str(basic_role_fixture.id)

    response = admin_authenticated_client.delete(f"/admin/roles/{role_id}")

    assert response.status_code == 204


def test_assign_role_to_user_success(
    admin_authenticated_client: TestClient,
    db_session: Session,
    basic_role_fixture: Role,
):
    """Kiểm tra gán role cho user thành công."""
    # Tạo user test
    test_user = User(
        email=f"test_assign_{uuid.uuid4()}@example.com",
        hashed_password="hashed",
        full_name="Test Assign User",
        is_active=True,
    )
    db_session.add(test_user)
    db_session.commit()
    db_session.refresh(test_user)

    assign_data = {"role_id": str(basic_role_fixture.id)}

    response = admin_authenticated_client.post(
        f"/admin/users/{test_user.id}/roles", json=assign_data
    )

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(test_user.id)
    # Kiểm tra role đã được gán
    role_names = [role["name"] for role in data["roles"]]
    assert basic_role_fixture.name in role_names


def test_get_all_permissions_success(admin_authenticated_client: TestClient):
    """Kiểm tra lấy danh sách permissions thành công."""
    response = admin_authenticated_client.get("/admin/permissions")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
