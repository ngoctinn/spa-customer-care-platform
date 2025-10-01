# app/api/schedules_api.py
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.core.dependencies import get_db_session  # Tạm thời chưa cần check quyền
from app.schemas.schedules_schema import (
    DefaultSchedulePublic,
    DefaultScheduleUpdate,
)
from app.services import schedules_service

# TODO: Khi hệ thống phân quyền hoàn chỉnh, uncomment các dòng sau
# from app.core.dependencies import has_permission, get_current_admin_user

router = APIRouter()


@router.get(
    "/users/{user_id}/default-schedules",
    response_model=List[DefaultSchedulePublic],
    # dependencies=[Depends(has_permission("manage_schedules"))] # Sẽ dùng sau
)
def get_user_default_schedules(
    *, session: Session = Depends(get_db_session), user_id: uuid.UUID
):
    """
    Lấy lịch làm việc mặc định của một nhân viên.
    Nếu chưa có, hệ thống sẽ tự tạo lịch trống.
    """
    schedules = schedules_service.get_or_create_default_schedules(
        db=session, user_id=user_id
    )
    return schedules


@router.put(
    "/users/{user_id}/default-schedules",
    response_model=List[DefaultSchedulePublic],
    # dependencies=[Depends(has_permission("manage_schedules"))] # Sẽ dùng sau
)
def update_user_default_schedules(
    *,
    session: Session = Depends(get_db_session),
    user_id: uuid.UUID,
    schedules_data: DefaultScheduleUpdate,
):
    """
    Tạo hoặc cập nhật toàn bộ lịch làm việc mặc định cho một nhân viên.
    Gửi một mảng chứa 7 object, mỗi object cho một ngày trong tuần.
    """
    updated_schedules = schedules_service.update_default_schedules(
        db=session, user_id=user_id, schedules_in=schedules_data.schedules
    )
    return updated_schedules
