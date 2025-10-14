# tests/test_images_api.py
import uuid
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.models.catalog_model import Image
from app.models.users_model import User


# =================================================================
# Tests cho Tag "Images" - Image Management
# =================================================================


@pytest.fixture(scope="function")
def basic_image_fixture(db_session: Session, admin_user: User) -> Image:
    """Fixture tạo một Image cơ bản."""
    db_image = Image(
        filename=f"test_image_{uuid.uuid4()}.jpg",
        original_filename="test.jpg",
        file_path=f"/uploads/test_image_{uuid.uuid4()}.jpg",
        url=f"https://example.com/uploads/test_image_{uuid.uuid4()}.jpg",
        file_size=1024,
        content_type="image/jpeg",
        alt_text="Test image",
        uploaded_by_user_id=admin_user.id,
    )
    db_session.add(db_image)
    db_session.commit()
    db_session.refresh(db_image)
    return db_image


def test_list_catalog_images_admin_success(admin_authenticated_client: TestClient):
    """Kiểm tra admin lấy danh sách ảnh catalog thành công."""
    response = admin_authenticated_client.get("/images?scope=catalog")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_list_personal_images_user_success(authenticated_client: TestClient):
    """Kiểm tra user lấy danh sách ảnh cá nhân thành công."""
    response = authenticated_client.get("/images?scope=personal")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_list_catalog_images_user_forbidden(authenticated_client: TestClient):
    """Kiểm tra user thường không thể truy cập catalog images."""
    response = authenticated_client.get("/images?scope=catalog")

    assert response.status_code == 403


def test_delete_image_admin_success(
    admin_authenticated_client: TestClient, basic_image_fixture: Image
):
    """Kiểm tra admin xóa ảnh thành công."""
    image_id = str(basic_image_fixture.id)

    response = admin_authenticated_client.delete(f"/images/{image_id}")

    assert response.status_code == 204

    # Note: No GET endpoint for individual image, so can't check if deleted


def test_delete_image_user_forbidden(
    authenticated_client: TestClient, basic_image_fixture: Image
):
    """Kiểm tra user thường không thể xóa ảnh."""
    image_id = str(basic_image_fixture.id)

    response = authenticated_client.delete(f"/images/{image_id}")

    assert response.status_code == 403
