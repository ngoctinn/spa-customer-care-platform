# app/api/staff_api.py
import uuid
from typing import List
from fastapi import APIRouter, Depends, status

from sqlmodel import Session
from app.core.dependencies import (
    get_current_admin_user,
    get_db_session,
    get_current_user,
)
from app.models.users_model import User

# SỬA LỖI: Bỏ import StaffScheduleCollection và các import không dùng đến
from app.schemas.staff_schema import (
    StaffOffboardingResult,
    StaffProfilePublic,
    StaffProfileUpdate,
    StaffProfileWithServices,
    StaffScheduleCreate,  # Đảm bảo có import này
    StaffSchedulePublic,
    StaffScheduleUpdate,
    StaffServiceAssignment,
    StaffTimeOffCreate,
    StaffTimeOffPublic,
    StaffTimeOffUpdateStatus,
)
from app.services.staff_service import staff_service

router = APIRouter()


@router.get(
    "/",
    response_model=List[StaffProfilePublic],
    dependencies=[Depends(get_current_admin_user)],
    summary="[Admin] Get all staff profiles",
)
def get_all_staff(db: Session = Depends(get_db_session)):
    return staff_service.list_staff_profiles(db=db)


@router.get(
    "/{staff_id}",
    response_model=StaffProfileWithServices,
    dependencies=[Depends(get_current_admin_user)],
    summary="[Admin] Get staff profile details by profile ID",
)
def get_staff_detail(staff_id: uuid.UUID, db: Session = Depends(get_db_session)):
    return staff_service.get_staff_profile_detail(db=db, staff_id=staff_id)


@router.put(
    "/{staff_id}",
    response_model=StaffProfilePublic,
    dependencies=[Depends(get_current_admin_user)],
    summary="[Admin] Update a staff profile",
)
def update_staff(
    staff_id: uuid.UUID,
    body: StaffProfileUpdate,
    db: Session = Depends(get_db_session),
):
    return staff_service.update_staff_profile(db=db, staff_id=staff_id, data=body)


@router.put(
    "/{staff_id}/services",
    response_model=StaffProfileWithServices,
    dependencies=[Depends(get_current_admin_user)],
    summary="[Admin] Assign services to a staff member",
)
def assign_services(
    staff_id: uuid.UUID,
    body: StaffServiceAssignment,
    db: Session = Depends(get_db_session),
):
    return staff_service.assign_services_to_staff(db=db, staff_id=staff_id, assignment=body)


@router.put(
    "/{staff_id}/schedules",
    response_model=List[StaffSchedulePublic],
    dependencies=[Depends(get_current_admin_user)],
    summary="[Admin] Set weekly recurring schedules for a staff member",
)
def set_staff_schedules(
    staff_id: uuid.UUID,
    # SỬA LỖI: Nhận trực tiếp một List thay vì một object bọc ngoài
    schedules: List[StaffScheduleCreate],
    db: Session = Depends(get_db_session),
):
    """
    Thiết lập lịch lặp hàng tuần cho nhân viên (mảng các entry).
    """
    return staff_service.set_weekly_schedules(db=db, staff_id=staff_id, payload=schedules)


@router.put(
    "/schedules/{schedule_id}",
    response_model=StaffSchedulePublic,
    dependencies=[Depends(get_current_admin_user)],
    summary="[Admin] Update a specific staff schedule entry",
)
def update_staff_schedule(
    schedule_id: uuid.UUID,
    body: StaffScheduleUpdate,
    db: Session = Depends(get_db_session),
):
    return staff_service.update_staff_schedule(db=db, schedule_id=schedule_id, payload=body)


@router.post(
    "/time-off",
    response_model=StaffTimeOffPublic,
    status_code=status.HTTP_201_CREATED,
    summary="Create a time-off request (for self or by admin)",
)
def create_time_off_request(
    body: StaffTimeOffCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    return staff_service.create_time_off_request(db=db, requester=current_user, data=body)


@router.put(
    "/time-off/{request_id}",
    response_model=StaffTimeOffPublic,
    dependencies=[Depends(get_current_admin_user)],
    summary="[Admin] Approve or reject a time-off request",
)
def update_time_off_status(
    request_id: uuid.UUID,
    body: StaffTimeOffUpdateStatus,
    approver: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db_session),
):
    return staff_service.update_time_off_status(db=db, request_id=request_id, approver=approver, data=body)


@router.post(
    "/{staff_id}/offboard",
    response_model=StaffOffboardingResult,
    dependencies=[Depends(get_current_admin_user)],
    summary="[Admin] Offboard a staff member",
)
def offboard_staff(
    staff_id: uuid.UUID,
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db_session),
):
    return staff_service.offboard_staff(db=db, staff_id=staff_id, admin_user=admin_user)
