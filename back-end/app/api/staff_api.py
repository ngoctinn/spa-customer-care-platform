# app/api/staff_api.py
"""Các endpoint phục vụ quản lý nhân viên spa."""

from __future__ import annotations

import datetime as dt
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session

from app.core.dependencies import (
    get_current_admin_user,
    get_current_user,
    get_db_session,
)
from app.models.users_model import User
from app.schemas.staff_schema import (
    StaffOffboardingResult,
    StaffProfileCreate,
    StaffProfilePublic,
    StaffProfileUpdate,
    StaffProfileWithServices,
    StaffScheduleBulkCreate,
    StaffScheduleCollection,
    StaffSchedulePublic,
    StaffScheduleUpdate,
    StaffServiceAssignment,
    StaffTimeOffCreate,
    StaffTimeOffPublic,
    StaffTimeOffUpdateStatus,
)
from app.services import staff_service


router = APIRouter()


def _parse_week_start(value: str | None) -> dt.date | None:
    if not value:
        return None
    try:
        parsed = dt.datetime.fromisoformat(value)
    except ValueError as exc:  # pragma: no cover - guard clause
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            detail="Giá trị week_start phải ở định dạng ISO (YYYY-MM-DD)",
        ) from exc
    return parsed.date()


# ---------------------------------------------------------------------------
# Hồ sơ nhân viên
# ---------------------------------------------------------------------------


@router.post(
    "/",
    response_model=StaffProfilePublic,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(get_current_admin_user)],
)
def create_staff(
    *, session: Session = Depends(get_db_session), body: StaffProfileCreate
) -> StaffProfilePublic:
    return staff_service.create_staff_profile(db=session, data=body)


@router.get(
    "/",
    response_model=List[StaffProfilePublic],
    dependencies=[Depends(get_current_admin_user)],
)
def list_staff(
    *,
    session: Session = Depends(get_db_session),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, gt=0, le=500),
) -> List[StaffProfilePublic]:
    return staff_service.list_staff_profiles(db=session, skip=skip, limit=limit)


@router.get(
    "/{staff_id}",
    response_model=StaffProfileWithServices,
    dependencies=[Depends(get_current_admin_user)],
)
def get_staff_detail(
    staff_id: uuid.UUID, session: Session = Depends(get_db_session)
) -> StaffProfileWithServices:
    return staff_service.get_staff_profile_detail(db=session, staff_id=staff_id)


@router.put(
    "/{staff_id}",
    response_model=StaffProfilePublic,
    dependencies=[Depends(get_current_admin_user)],
)
def update_staff(
    staff_id: uuid.UUID,
    body: StaffProfileUpdate,
    session: Session = Depends(get_db_session),
) -> StaffProfilePublic:
    return staff_service.update_staff_profile(db=session, staff_id=staff_id, data=body)


@router.post(
    "/{staff_id}/services",
    response_model=StaffProfileWithServices,
    dependencies=[Depends(get_current_admin_user)],
)
def assign_services(
    staff_id: uuid.UUID,
    body: StaffServiceAssignment,
    session: Session = Depends(get_db_session),
) -> StaffProfileWithServices:
    return staff_service.assign_services_to_staff(
        db=session, staff_id=staff_id, assignment=body
    )


# ---------------------------------------------------------------------------
# Quản lý lịch làm việc
# ---------------------------------------------------------------------------


@router.post(
    "/{staff_id}/schedules",
    response_model=List[StaffSchedulePublic],
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(get_current_admin_user)],
)
def set_weekly_schedule(
    staff_id: uuid.UUID,
    body: StaffScheduleBulkCreate,
    session: Session = Depends(get_db_session),
) -> List[StaffSchedulePublic]:
    return staff_service.set_weekly_schedules(
        db=session, staff_id=staff_id, payload=body
    )


@router.put(
    "/schedules/{schedule_id}",
    response_model=StaffSchedulePublic,
    dependencies=[Depends(get_current_admin_user)],
)
def update_schedule(
    schedule_id: uuid.UUID,
    body: StaffScheduleUpdate,
    session: Session = Depends(get_db_session),
) -> StaffSchedulePublic:
    return staff_service.update_staff_schedule(
        db=session, schedule_id=schedule_id, data=body
    )


@router.get(
    "/{staff_id}/schedule",
    response_model=StaffScheduleCollection,
)
def get_staff_schedule(
    staff_id: uuid.UUID,
    week_start: str | None = Query(None, description="Ngày bắt đầu tuần (ISO)"),
    session: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> StaffScheduleCollection:
    # Nhân viên chỉ xem được lịch của chính mình
    if not current_user.is_admin and (
        not current_user.staff_profile or current_user.staff_profile.id != staff_id
    ):
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền xem lịch của nhân viên khác",
        )

    parsed_week = _parse_week_start(week_start)
    return staff_service.get_staff_schedule(
        db=session, staff_id=staff_id, week_start=parsed_week
    )


@router.get(
    "/schedules",
    response_model=List[StaffScheduleCollection],
    dependencies=[Depends(get_current_admin_user)],
)
def get_overall_schedule(
    week_start: str = Query(..., description="Ngày bắt đầu tuần (ISO)"),
    staff_id: uuid.UUID | None = Query(None),
    session: Session = Depends(get_db_session),
) -> List[StaffScheduleCollection]:
    parsed_week = _parse_week_start(week_start)
    if parsed_week is None:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            detail="Cần truyền week_start theo định dạng YYYY-MM-DD",
        )
    return staff_service.get_weekly_schedule_overview(
        db=session, week_start=parsed_week, staff_id=staff_id
    )


# ---------------------------------------------------------------------------
# Nghỉ phép
# ---------------------------------------------------------------------------


@router.post(
    "/time-off",
    response_model=StaffTimeOffPublic,
)
def request_time_off(
    body: StaffTimeOffCreate,
    session: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> StaffTimeOffPublic:
    session.refresh(current_user, attribute_names=["staff_profile"])
    return staff_service.create_time_off_request(
        db=session,
        requester=current_user.staff_profile,
        payload=body,
    )


@router.put(
    "/time-off/{request_id}",
    response_model=StaffTimeOffPublic,
    dependencies=[Depends(get_current_admin_user)],
)
def approve_time_off(
    request_id: uuid.UUID,
    body: StaffTimeOffUpdateStatus,
    session: Session = Depends(get_db_session),
    admin_user: User = Depends(get_current_admin_user),
) -> StaffTimeOffPublic:
    return staff_service.update_time_off_status(
        db=session, request_id=request_id, data=body, approver=admin_user
    )


# ---------------------------------------------------------------------------
# Offboarding
# ---------------------------------------------------------------------------


@router.post(
    "/{staff_id}/offboard",
    response_model=StaffOffboardingResult,
    dependencies=[Depends(get_current_admin_user)],
)
def offboard_staff(
    staff_id: uuid.UUID,
    session: Session = Depends(get_db_session),
    admin_user: User = Depends(get_current_admin_user),
) -> StaffOffboardingResult:
    return staff_service.offboard_staff(
        db=session, staff_id=staff_id, admin_user=admin_user
    )
