# tests/test_treatment_plans_api.py
import uuid
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.models.treatment_plans_model import TreatmentPlan
from app.models.catalog_model import Category
from app.schemas.catalog_schema import CategoryTypeEnum


# =================================================================
# Tests cho Tag "Treatment Plans" - Treatment Plan CRUD
# =================================================================


@pytest.fixture(scope="function")
def treatment_plan_category_fixture(db_session: Session) -> Category:
    """Fixture tạo Category loại 'treatment_plan'."""
    category_data = Category(
        name=f"Liệu trình Test {uuid.uuid4()}",
        description="Category cho test treatment plan",
        category_type=CategoryTypeEnum.treatment_plan.value,
    )
    db_session.add(category_data)
    db_session.commit()
    db_session.refresh(category_data)
    return category_data


@pytest.fixture(scope="function")
def basic_treatment_plan_fixture(
    db_session: Session, treatment_plan_category_fixture: Category
) -> TreatmentPlan:
    """Fixture tạo một TreatmentPlan cơ bản."""
    db_treatment_plan = TreatmentPlan(
        name=f"Liệu trình Test {uuid.uuid4()}",
        description="Mô tả liệu trình test",
        price=1000000.0,
        total_sessions=10,
        category_id=treatment_plan_category_fixture.id,
    )
    db_session.add(db_treatment_plan)
    db_session.commit()
    db_session.refresh(db_treatment_plan)
    return db_treatment_plan


# def test_create_treatment_plan_success(admin_authenticated_client: TestClient):
#     """Kiểm tra tạo Treatment Plan thành công."""
#     # Test này cần setup phức tạp với category và service, bỏ qua tạm thời
#     pass


def test_get_all_treatment_plans_success(admin_authenticated_client: TestClient):
    """Kiểm tra lấy danh sách Treatment Plans thành công."""
    response = admin_authenticated_client.get("/treatment-plans")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_get_treatment_plan_by_id_success(
    admin_authenticated_client: TestClient, basic_treatment_plan_fixture: TreatmentPlan
):
    """Kiểm tra lấy Treatment Plan theo ID thành công."""
    treatment_plan_id = str(basic_treatment_plan_fixture.id)

    response = admin_authenticated_client.get(f"/treatment-plans/{treatment_plan_id}")

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == treatment_plan_id
    assert data["name"] == basic_treatment_plan_fixture.name


# def test_update_treatment_plan_success(
#     admin_authenticated_client: TestClient, basic_treatment_plan_fixture: TreatmentPlan
# ):
#     """Kiểm tra cập nhật Treatment Plan thành công."""
#     # Test phức tạp, bỏ qua tạm thời
#     pass


def test_delete_treatment_plan_success(
    admin_authenticated_client: TestClient, basic_treatment_plan_fixture: TreatmentPlan
):
    """Kiểm tra xóa mềm Treatment Plan thành công."""
    treatment_plan_id = str(basic_treatment_plan_fixture.id)

    # Xóa
    response_delete = admin_authenticated_client.delete(
        f"/treatment-plans/{treatment_plan_id}"
    )
    assert response_delete.status_code == 204

    # Kiểm tra không thể lấy lại
    response_get = admin_authenticated_client.get(
        f"/treatment-plans/{treatment_plan_id}"
    )
    assert response_get.status_code == 404
