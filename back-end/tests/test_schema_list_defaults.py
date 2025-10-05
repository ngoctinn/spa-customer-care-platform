import uuid

import pytest

from app.schemas.catalog_schema import CategoryPublic, CategoryPublicWithItems
from app.schemas.products_schema import ProductPublicWithDetails
from app.schemas.roles_schema import RolePublicWithPermissions
from app.schemas.services_schema import ServicePublicWithDetails
from app.schemas.treatment_plans_schema import (
    TreatmentPlanCreate,
    TreatmentPlanPublicWithDetails,
)
from app.schemas.users_schema import UserPublicWithRolesAndPermissions


# Helper factories to keep the parametrization concise

def make_category_public() -> CategoryPublic:
    return CategoryPublic(
        id=uuid.uuid4(),
        name="Category",
        description=None,
        category_type="service",
    )


def make_service_kwargs() -> dict:
    return {
        "id": uuid.uuid4(),
        "name": "Service",
        "description": "Desc",
        "price": 100.0,
        "duration_minutes": 60,
        "preparation_notes": None,
        "aftercare_instructions": None,
        "contraindications": None,
        "category_ids": [uuid.uuid4()],
    }


def make_treatment_plan_kwargs() -> dict:
    return {
        "id": uuid.uuid4(),
        "name": "Plan",
        "description": "Desc",
        "price": 100.0,
        "total_sessions": 5,
        "category_id": uuid.uuid4(),
    }


def make_product_kwargs() -> dict:
    return {
        "id": uuid.uuid4(),
        "name": "Product",
        "description": "Desc",
        "price": 10.0,
        "stock": 1,
        "is_retail": True,
        "is_consumable": False,
        "base_unit": "unit",
        "consumable_unit": None,
        "conversion_rate": None,
        "category_id": uuid.uuid4(),
    }


@pytest.mark.parametrize(
    "model_cls, kwargs_factory, list_fields",
    [
        (
            UserPublicWithRolesAndPermissions,
            lambda: {
                "id": uuid.uuid4(),
                "email": f"user-{uuid.uuid4()}@example.com",
                "phone": None,
                "full_name": None,
                "is_active": True,
                "is_superuser": False,
            },
            ("roles",),
        ),
        (
            RolePublicWithPermissions,
            lambda: {
                "id": uuid.uuid4(),
                "name": "role",
                "description": None,
            },
            ("permissions",),
        ),
        (
            ServicePublicWithDetails,
            lambda: make_service_kwargs(),
            ("categories", "images"),
        ),
        (
            TreatmentPlanCreate,
            lambda: {
                "name": "Plan",
                "description": "Desc",
                "price": 100.0,
                "total_sessions": 5,
                "category_id": uuid.uuid4(),
            },
            ("steps",),
        ),
        (
            TreatmentPlanPublicWithDetails,
            lambda: {
                **make_treatment_plan_kwargs(),
                "category": make_category_public(),
            },
            ("images", "steps"),
        ),
        (
            ProductPublicWithDetails,
            lambda: {
                **make_product_kwargs(),
                "category": make_category_public(),
            },
            ("images",),
        ),
        (
            CategoryPublicWithItems,
            lambda: {
                "id": uuid.uuid4(),
                "name": "Category",
                "description": None,
                "category_type": "service",
            },
            ("items",),
        ),
    ],
)
def test_schema_list_defaults_are_independent(model_cls, kwargs_factory, list_fields):
    instance_a = model_cls(**kwargs_factory())
    instance_b = model_cls(**kwargs_factory())

    for field in list_fields:
        list_a = getattr(instance_a, field)
        list_b = getattr(instance_b, field)

        assert list_a == []
        assert list_b == []
        assert list_a is not list_b
