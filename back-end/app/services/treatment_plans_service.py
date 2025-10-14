# app/services/treatment_plans_service.py (Đã chuyển thành Class Service)
import uuid
from typing import List, Optional

from fastapi import HTTPException, status

# Thêm import Load từ sqlalchemy.orm
from sqlalchemy.orm import selectinload, Load
from sqlmodel import Session, select

from app.core.messages import CategoryMessages, TreatmentPlanMessages
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
                detail=TreatmentPlanMessages.TREATMENT_PLAN_CATEGORY_INVALID,
            )

    async def create(
        self, db: Session, *, obj_in: TreatmentPlanCreate
    ) -> TreatmentPlan:
        # --- BẮT ĐẦU LOGIC GIAO TÁC ---
        # 1. Validations
        category = catalog_service.get_category_by_id(db, obj_in.category_id)
        self._ensure_treatment_plan_category(category)

        existing_plan = db.exec(
            select(TreatmentPlan).where(
                TreatmentPlan.name == obj_in.name, TreatmentPlan.is_deleted == False
            )
        ).first()
        if existing_plan:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=TreatmentPlanMessages.TREATMENT_PLAN_NAME_EXISTS.format(
                    name=obj_in.name
                ),
            )

        for step_in in obj_in.steps:
            services_service.get_by_id(db, id=step_in.service_id)

        # 2. Chuẩn bị các đối tượng để thêm vào DB
        plan_data = obj_in.model_dump(
            exclude={"steps", "existing_image_ids", "primary_image_id"}
        )
        db_plan = TreatmentPlan(**plan_data)
        db.add(db_plan)

        # Thêm các steps vào session, nhưng chưa commit.
        # Phải flush để db_plan có ID cho các steps.
        db.flush()
        db.refresh(db_plan)

        for step_in in obj_in.steps:
            db_step = TreatmentPlanStep(
                **step_in.model_dump(), treatment_plan_id=db_plan.id
            )
            db.add(db_step)

        # 3. Đồng bộ hình ảnh
        await sync_images_for_entity(
            db,
            entity=db_plan,
            owner_type="treatment_plan",
            existing_image_ids=obj_in.existing_image_ids,
            primary_image_id=obj_in.primary_image_id,
        )

        # 4. Commit một lần duy nhất
        try:
            db.commit()
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=TreatmentPlanMessages.TREATMENT_PLAN_SAVE_ERROR.format(error=e),
            )

        db.refresh(db_plan)
        # --- KẾT THÚC LOGIC GIAO TÁC ---

        return self.get_by_id(db, id=db_plan.id)

    # --- REPLACING: update_treatment_plan -> update ---
    async def update(
        self,
        db: Session,
        *,
        db_obj: TreatmentPlan,
        obj_in: TreatmentPlanUpdate,
    ) -> TreatmentPlan:
        # --- BẮT ĐẦU LOGIC GIAO TÁC ---
        plan_data = obj_in.model_dump(exclude_unset=True)

        # 1. Validations
        if "name" in plan_data and plan_data["name"] != db_obj.name:
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
                    detail=TreatmentPlanMessages.TREATMENT_PLAN_NAME_EXISTS.format(
                        name=plan_data["name"]
                    ),
                )

        if "category_id" in plan_data and plan_data["category_id"]:
            category = catalog_service.get_category_by_id(db, plan_data["category_id"])
            self._ensure_treatment_plan_category(category)

        # 2. Cập nhật các trường cơ bản
        update_data_for_base = {
            k: v
            for k, v in plan_data.items()
            if k not in ["existing_image_ids", "primary_image_id"]
        }
        for key, value in update_data_for_base.items():
            setattr(db_obj, key, value)
        db.add(db_obj)

        # 3. Đồng bộ hình ảnh
        await sync_images_for_entity(
            db,
            entity=db_obj,
            owner_type="treatment_plan",
            existing_image_ids=obj_in.existing_image_ids,
            primary_image_id=obj_in.primary_image_id,
        )

        # 4. Commit một lần duy nhất
        try:
            db.commit()
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=TreatmentPlanMessages.TREATMENT_PLAN_SAVE_ERROR.format(error=e),
            )

        db.refresh(db_obj)
        # --- KẾT THÚC LOGIC GIAO TÁC ---

        return self.get_by_id(db, id=db_obj.id)


# Tạo một instance duy nhất để import vào API
treatment_plans_service = TreatmentPlanService()
