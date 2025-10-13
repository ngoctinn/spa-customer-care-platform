# app/api/staff_api.py
"""Các endpoint phục vụ quản lý nhân viên spa."""
from __future__ import annotations
import datetime
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
    StaffScheduleCollection,
    StaffSchedulePublic,
    StaffScheduleUpdate,
    StaffServiceAssignment,
    StaffTimeOffCreate,
    StaffTimeOffPublic,
    StaffTimeOffUpdateStatus,
)
from app.services.staff_service import staff_service

router = APIRouter()


# --- Helper Dependency ---
def _parse_week_start(week_start: str | None) -> datetime.date | None:
    if week_start is None:
        return None
    try:
        return datetime.datetime.fromisoformat(week_start).date()
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Giá trị week_start phải ở định dạng ISO (YYYY-MM-DD)",
        )


# =================================================================
# STAFF PROFILE ENDPOINTS (Admin only)
# =================================================================


@router.post(
    "/",
    response_model=StaffProfilePublic,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(get_current_admin_user)],
)
def create_staff(
    *, session: Session = Depends(get_db_session), body: StaffProfileCreate
):
    return staff_service.create_staff_profile(db=session, data=body)


@router.get(
    "/",
    response_model=List[StaffProfilePublic],
    dependencies=[Depends(get_current_admin_user)],
)
def list_staff(
    session: Session = Depends(get_db_session), skip: int = 0, limit: int = 100
):
    return staff_service.list_staff_profiles(db=session, skip=skip, limit=limit)


@router.get(
    "/{staff_id}",
    response_model=StaffProfileWithServices,
    dependencies=[Depends(get_current_admin_user)],
)
def get_staff_detail(staff_id: uuid.UUID, session: Session = Depends(get_db_session)):
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
):
    return staff_service.update_staff_profile(db=session, staff_id=staff_id, data=body)


@router.put(
    "/{staff_id}/services",
    response_model=StaffProfileWithServices,
    dependencies=[Depends(get_current_admin_user)],
)
def assign_services(
    staff_id: uuid.UUID,
    assignment: StaffServiceAssignment,
    session: Session = Depends(get_db_session),
):
    return staff_service.assign_services_to_staff(
        db=session, staff_id=staff_id, assignment=assignment
    )


# =================================================================
# STAFF SCHEDULE ENDPOINTS (Admin only for setup, Staff can view own)
# =================================================================


@router.put(
    "/{staff_id}/schedules",
    response_model=List[StaffSchedulePublic],
    dependencies=[Depends(get_current_admin_user)],
)
def set_weekly_schedule(
    staff_id: uuid.UUID,
    payload: StaffScheduleCollection,
    session: Session = Depends(get_db_session),
):
    return staff_service.set_weekly_schedules(
        db=session, staff_id=staff_id, payload=payload.schedules
    )


@router.put(
    "/schedules/{schedule_id}",
    response_model=StaffSchedulePublic,
    dependencies=[Depends(get_current_admin_user)],
)
def update_schedule(
    schedule_id: uuid.UUID,
    payload: StaffScheduleUpdate,
    session: Session = Depends(get_db_session),
):
    return staff_service.update_staff_schedule(
        db=session, schedule_id=schedule_id, payload=payload
    )


# =================================================================
# TIME OFF ENDPOINTS
# =================================================================


@router.post("/time-off", response_model=StaffTimeOffPublic, status_code=201)
def request_time_off(
    *,
    session: Session = Depends(get_db_session),
    requester: User = Depends(get_current_user),
    data: StaffTimeOffCreate,
):
    return staff_service.create_time_off_request(
        db=session, requester=requester, data=data
    )


@router.put(
    "/time-off/{request_id}",
    response_model=StaffTimeOffPublic,
    dependencies=[Depends(get_current_admin_user)],
)
def approve_time_off(
    request_id: uuid.UUID,
    data: StaffTimeOffUpdateStatus,
    session: Session = Depends(get_db_session),
    admin_user: User = Depends(get_current_admin_user),
):
    return staff_service.update_time_off_status(
        db=session, request_id=request_id, approver=admin_user, data=data
    )


# =================================================================
# OFFBOARDING ENDPOINT (Admin only)
# =================================================================


@router.post(
    "/{staff_id}/offboard",
    response_model=StaffOffboardingResult,
    dependencies=[Depends(get_current_admin_user)],
)
def offboard_staff(
    staff_id: uuid.UUID,
    session: Session = Depends(get_db_session),
    admin_user: User = Depends(get_current_admin_user),
):
    return staff_service.offboard_staff(
        db=session, staff_id=staff_id, admin_user=admin_user
    )
