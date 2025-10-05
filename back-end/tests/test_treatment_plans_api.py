import uuid

from app.models.catalog_model import Category, Image
from app.models.services_model import Service
from app.models.treatment_plans_model import TreatmentPlan, TreatmentPlanStep
from app.schemas.catalog_schema import CategoryTypeEnum


def _create_service(session) -> Service:
    service_category = Category(
        name="Chăm sóc da",
        description="Danh mục dịch vụ",
        category_type=CategoryTypeEnum.service,
    )
    session.add(service_category)
    session.commit()
    session.refresh(service_category)

    service = Service(
        name="Làm sạch da",
        description="Dịch vụ làm sạch",
        price=250000,
        duration_minutes=60,
        preparation_notes=None,
        aftercare_instructions=None,
        contraindications=None,
    )
    service.categories.append(service_category)
    session.add(service)
    session.commit()
    session.refresh(service)
    return service


def test_get_all_treatment_plans_returns_data(client, session):
    service = _create_service(session)

    tp_category = Category(
        name="Liệu trình",
        description="Danh mục liệu trình",
        category_type=CategoryTypeEnum.treatment_plan,
    )
    session.add(tp_category)
    session.commit()
    session.refresh(tp_category)

    treatment_plan = TreatmentPlan(
        name="Liệu trình chăm sóc da",
        description="Quy trình chăm sóc da toàn diện",
        price=1500000,
        total_sessions=5,
        category_id=tp_category.id,
    )
    session.add(treatment_plan)
    session.commit()
    session.refresh(treatment_plan)

    step = TreatmentPlanStep(
        treatment_plan_id=treatment_plan.id,
        service_id=service.id,
        step_number=1,
        description="Bước đầu tiên",
    )
    session.add(step)

    image = Image(
        url="https://example.com/treatment.jpg",
        alt_text="Liệu trình",
        is_primary=True,
        treatment_plan_id=treatment_plan.id,
    )
    session.add(image)
    session.commit()

    response = client.get("/treatment-plans")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    plan = data[0]
    assert plan["id"] == str(treatment_plan.id)
    assert plan["category"]["id"] == str(tp_category.id)
    assert plan["images"][0]["url"] == image.url
    assert plan["steps"][0]["service"]["id"] == str(service.id)


def test_get_treatment_plan_not_found_returns_404(client):
    response = client.get(f"/treatment-plans/{uuid.uuid4()}")
    assert response.status_code == 404
    assert "TreatmentPlan" in response.json()["detail"]
