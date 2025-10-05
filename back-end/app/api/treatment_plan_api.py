# app/api/treatment_plan_api.py
import uuid
from typing import List

from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.core.dependencies import get_db_session
from app.schemas.treatment_plans_schema import (
    TreatmentPlanCreate,
    TreatmentPlanPublicWithDetails,
    TreatmentPlanUpdate,
)
from app.services import treatment_plans_service


router = APIRouter()


@router.post(
    "",
    response_model=TreatmentPlanPublicWithDetails,
    status_code=status.HTTP_201_CREATED,
)
async def create_treatment_plan(
    *,
    session: Session = Depends(get_db_session),
    treatment_plan_in: TreatmentPlanCreate,
):
    """Tạo mới một liệu trình cùng các bước."""

    return await treatment_plans_service.create_treatment_plan(
        db=session, treatment_plan_in=treatment_plan_in
    )


@router.get("", response_model=List[TreatmentPlanPublicWithDetails])
def get_all_treatment_plans(
    session: Session = Depends(get_db_session), skip: int = 0, limit: int = 100
):
    """Lấy danh sách tất cả liệu trình chưa bị xóa mềm."""

    return treatment_plans_service.get_all_treatment_plans(
        db=session, skip=skip, limit=limit
    )


@router.get("/{treatment_plan_id}", response_model=TreatmentPlanPublicWithDetails)
def get_treatment_plan_by_id(
    treatment_plan_id: uuid.UUID, session: Session = Depends(get_db_session)
):
    """Lấy chi tiết một liệu trình theo ID."""

    return treatment_plans_service.get_treatment_plan_by_id(
        db=session, treatment_plan_id=treatment_plan_id
    )


@router.put("/{treatment_plan_id}", response_model=TreatmentPlanPublicWithDetails)
async def update_treatment_plan(
    *,
    treatment_plan_id: uuid.UUID,
    treatment_plan_in: TreatmentPlanUpdate,
    session: Session = Depends(get_db_session),
):
    """Cập nhật thông tin một liệu trình."""

    db_treatment_plan = treatment_plans_service.get_treatment_plan_by_id(
        db=session, treatment_plan_id=treatment_plan_id
    )
    return await treatment_plans_service.update_treatment_plan(
        db=session,
        db_treatment_plan=db_treatment_plan,
        treatment_plan_in=treatment_plan_in,
    )


@router.delete("/{treatment_plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_treatment_plan(
    treatment_plan_id: uuid.UUID, session: Session = Depends(get_db_session)
):
    """Xóa mềm một liệu trình."""

    db_treatment_plan = treatment_plans_service.get_treatment_plan_by_id(
        db=session, treatment_plan_id=treatment_plan_id
    )
    treatment_plans_service.delete_treatment_plan(
        db=session, db_treatment_plan=db_treatment_plan
    )
    return
