# app/services/treatment_plans_service.py (Đã chuyển thành Class Service)
import uuid
from typing import List, Optional

from fastapi import HTTPException, status

# Thêm import Load từ sqlalchemy.orm
from sqlalchemy.orm import selectinload, Load
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
from app.services.images_service import sync_images_for_entity
from .base_service import BaseService  # NEW: Import BaseService


class TreatmentPlanService(
    BaseService[TreatmentPlan, TreatmentPlanCreate, TreatmentPlanUpdate]
):
    def __init__(self):
        super().__init__(TreatmentPlan)

    # --- BƯỚC 1: IMPLEMENT HOOK: Tải quan hệ ---
    def _get_load_options(self) -> List[Load]:
        return [
            selectinload(TreatmentPlan.category),
            selectinload(TreatmentPlan.images),
            selectinload(TreatmentPlan.primary_image),
            # Tải quan hệ lồng nhau (steps -> service -> categories)
            selectinload(TreatmentPlan.steps)
            .selectinload(TreatmentPlanStep.service)
            .selectinload(Service.categories),
        ]

    # --- BƯỚC 2: IMPLEMENT HOOK: Lọc quan hệ soft-delete ---
    def _filter_relationships(self, treatment_plan: TreatmentPlan) -> TreatmentPlan:
        """Áp dụng bộ lọc soft-deleted lồng nhau cho TreatmentPlan."""
        # 1. Lọc hình ảnh và dọn dẹp primary_image_id
        treatment_plan.images = [
            image for image in treatment_plan.images if not image.is_deleted
        ]
        valid_image_ids = {image.id for image in treatment_plan.images}
        if (
            treatment_plan.primary_image_id
            and treatment_plan.primary_image_id not in valid_image_ids
        ):
            treatment_plan.primary_image_id = None

        # 2. Lọc các bước và dịch vụ soft-deleted
        filtered_steps: List[TreatmentPlanStep] = []
        for step in treatment_plan.steps:
            if step.is_deleted:
                continue
            if step.service and step.service.is_deleted:
                continue

            # Lọc category soft-deleted của dịch vụ trong bước
            if step.service:
                step.service.categories = [
                    category
                    for category in step.service.categories
                    if not category.is_deleted
                ]
            filtered_steps.append(step)

        treatment_plan.steps = filtered_steps
        return treatment_plan

    # --- Helper function (từ original _ensure_...) ---
    def _ensure_treatment_plan_category(self, category: Category) -> None:
        if category.category_type != CategoryTypeEnum.treatment_plan:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Danh mục không hợp lệ cho liệu trình.",
            )

    # --- REPLACING: create_treatment_plan -> create ---
    async def create(
        self, db: Session, *, obj_in: TreatmentPlanCreate
    ) -> TreatmentPlan:
        category = catalog_service.get_category_by_id(db, obj_in.category_id)
        self._ensure_treatment_plan_category(category)

        # ... (logic kiểm tra tên tồn tại)
        existing_plan = db.exec(
            select(TreatmentPlan).where(
                TreatmentPlan.name == obj_in.name,
                TreatmentPlan.is_deleted == False,
            )
        ).first()
        if existing_plan:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Liệu trình '{obj_in.name}' đã tồn tại.",
            )

        # Validate all services exist
        for step_in in obj_in.steps:
            services_service.get_by_id(db, id=step_in.service_id)

        # 1. Create the main object
        plan_data = obj_in.model_dump(
            exclude={"steps", "existing_image_ids", "primary_image_id"}
        )
        db_plan = TreatmentPlan(**plan_data)
        db.add(db_plan)
        db.commit()
        db.refresh(db_plan)

        # 2. Create nested steps
        for step_in in obj_in.steps:
            db_step = TreatmentPlanStep(
                **step_in.model_dump(), treatment_plan_id=db_plan.id
            )
            db.add(db_step)

        # 3. Sync images
        await sync_images_for_entity(
            db,
            entity=db_plan,
            owner_type="treatment_plan",
            existing_image_ids=obj_in.existing_image_ids,
            primary_image_id=obj_in.primary_image_id,
        )

        db.commit()
        # SỬ DỤNG PHƯƠNG THỨC KẾ THỪA
        return self.get_by_id(db, id=db_plan.id)

    # --- REPLACING: update_treatment_plan -> update ---
    async def update(
        self,
        db: Session,
        *,
        db_obj: TreatmentPlan,
        obj_in: TreatmentPlanUpdate,
    ) -> TreatmentPlan:
        plan_data = obj_in.model_dump(exclude_unset=True)
        plan_data.pop("existing_image_ids", None)
        plan_data.pop("primary_image_id", None)

        if "name" in plan_data:
            existing_plan = db.exec(
                select(TreatmentPlan).where(
                    TreatmentPlan.name == plan_data["name"],
                    TreatmentPlan.id != db_obj.id,
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
            self._ensure_treatment_plan_category(category)

        # Update base fields
        for key, value in plan_data.items():
            setattr(db_obj, key, value)

        db.add(db_obj)
        db.flush()

        # Sync images
        await sync_images_for_entity(
            db,
            entity=db_obj,
            owner_type="treatment_plan",
            existing_image_ids=obj_in.existing_image_ids,
            primary_image_id=obj_in.primary_image_id,
        )

        db.commit()
        # SỬ DỤNG PHƯƠNG THỨC KẾ THỪA
        return self.get_by_id(db, id=db_obj.id)

    # [LOẠI BỎ: get_all_treatment_plans, get_treatment_plan_by_id, delete_treatment_plan]


# NEW: Instantiate the class-based service
treatment_plans_service = TreatmentPlanService()
