# app/services/treatment_plans_service.py
import uuid
from typing import List

from fastapi import HTTPException, status
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select

from app.models.catalog_model import Category
from app.models.treatment_plans_model import TreatmentPlan, TreatmentPlanStep
from app.models.services_model import Service
from app.schemas.catalog_schema import CategoryTypeEnum
from app.schemas.treatment_plans_schema import (
    TreatmentPlanCreate,
    TreatmentPlanUpdate,
)
from app.services import catalog_service, services_service
from app.services.images_service import sync_entity_images


def _with_treatment_plan_relationships(statement):
    """Helper để load đầy đủ các quan hệ cho treatment plan."""

    return statement.options(
        selectinload(TreatmentPlan.category),
        selectinload(TreatmentPlan.images),
        selectinload(TreatmentPlan.primary_image),
        selectinload(TreatmentPlan.steps)
        .selectinload(TreatmentPlanStep.service)
        .selectinload(Service.categories),
    )


def _ensure_treatment_plan_category(category: Category) -> None:
    if category.category_type != CategoryTypeEnum.treatment_plan:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Danh mục được chọn không phải danh mục liệu trình.",
        )


def _filter_soft_deleted_relationships(
    treatment_plan: TreatmentPlan,
) -> TreatmentPlan:
    treatment_plan.images = [
        image for image in treatment_plan.images if not image.is_deleted
    ]
    valid_image_ids = {image.id for image in treatment_plan.images}
    if treatment_plan.primary_image_id not in valid_image_ids:
        treatment_plan.primary_image_id = None
    filtered_steps: List[TreatmentPlanStep] = []
    for step in treatment_plan.steps:
        if step.is_deleted:
            continue
        if step.service and step.service.is_deleted:
            continue
        if step.service:
            step.service.categories = [
                category for category in step.service.categories if not category.is_deleted
            ]
        filtered_steps.append(step)
    treatment_plan.steps = filtered_steps
    return treatment_plan


async def create_treatment_plan(
    db: Session, treatment_plan_in: TreatmentPlanCreate
) -> TreatmentPlan:
    """Tạo mới một treatment plan cùng với các bước."""

    category = catalog_service.get_category_by_id(db, treatment_plan_in.category_id)
    _ensure_treatment_plan_category(category)

    existing_plan = db.exec(
        select(TreatmentPlan).where(
            TreatmentPlan.name == treatment_plan_in.name,
            TreatmentPlan.is_deleted == False,
        )
    ).first()
    if existing_plan:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Liệu trình '{treatment_plan_in.name}' đã tồn tại.",
        )

    for step_in in treatment_plan_in.steps:
        services_service.get_service_by_id(db, step_in.service_id)

    plan_data = treatment_plan_in.model_dump(
        exclude={"steps", "existing_image_ids", "primary_image_id"}
    )
    db_plan = TreatmentPlan(**plan_data)
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)

    for step_in in treatment_plan_in.steps:
        db_step = TreatmentPlanStep(
            **step_in.model_dump(), treatment_plan_id=db_plan.id
        )
        db.add(db_step)

    await sync_entity_images(
        db,
        entity=db_plan,
        owner="treatment_plan",
        existing_image_ids=treatment_plan_in.existing_image_ids,
        primary_image_id=treatment_plan_in.primary_image_id,
        alt_text=db_plan.name,
    )

    db.commit()
    return get_treatment_plan_by_id(db, db_plan.id)


def get_all_treatment_plans(
    db: Session, skip: int = 0, limit: int = 100
) -> List[TreatmentPlan]:
    statement = _with_treatment_plan_relationships(
        select(TreatmentPlan)
        .where(TreatmentPlan.is_deleted == False)
        .offset(skip)
        .limit(limit)
    )
    treatment_plans = db.exec(statement).unique().all()
    return [
        _filter_soft_deleted_relationships(treatment_plan)
        for treatment_plan in treatment_plans
    ]


def get_treatment_plan_by_id(
    db: Session, treatment_plan_id: uuid.UUID
) -> TreatmentPlan:
    statement = _with_treatment_plan_relationships(
        select(TreatmentPlan).where(
            TreatmentPlan.id == treatment_plan_id,
            TreatmentPlan.is_deleted == False,
        )
    )
    treatment_plan = db.exec(statement).unique().first()
    if not treatment_plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"TreatmentPlan với ID {treatment_plan_id} không được tìm thấy.",
        )
    return _filter_soft_deleted_relationships(treatment_plan)


async def update_treatment_plan(
    db: Session,
    db_treatment_plan: TreatmentPlan,
    treatment_plan_in: TreatmentPlanUpdate,
) -> TreatmentPlan:
    plan_data = treatment_plan_in.model_dump(exclude_unset=True)
    plan_data.pop("existing_image_ids", None)
    plan_data.pop("primary_image_id", None)

    if "name" in plan_data:
        existing_plan = db.exec(
            select(TreatmentPlan).where(
                TreatmentPlan.name == plan_data["name"],
                TreatmentPlan.id != db_treatment_plan.id,
                TreatmentPlan.is_deleted == False,
            )
        ).first()
        if existing_plan:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Liệu trình '{plan_data['name']}' đã tồn tại.",
            )

    if "category_id" in plan_data and plan_data["category_id"]:
        category = catalog_service.get_category_by_id(db, plan_data["category_id"])
        _ensure_treatment_plan_category(category)

    for key, value in plan_data.items():
        setattr(db_treatment_plan, key, value)

    db.add(db_treatment_plan)
    db.flush()

    await sync_entity_images(
        db,
        entity=db_treatment_plan,
        owner="treatment_plan",
        existing_image_ids=treatment_plan_in.existing_image_ids,
        primary_image_id=treatment_plan_in.primary_image_id,
        alt_text=db_treatment_plan.name,
    )

    db.commit()
    return get_treatment_plan_by_id(db, db_treatment_plan.id)


def delete_treatment_plan(db: Session, db_treatment_plan: TreatmentPlan) -> TreatmentPlan:
    db_treatment_plan.is_deleted = True
    db.add(db_treatment_plan)
    db.commit()
    db.refresh(db_treatment_plan)
    return db_treatment_plan
