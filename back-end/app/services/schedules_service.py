# app/services/schedules_service.py
import uuid
from typing import List
from sqlmodel import Session, select

from app.core.messages import UserMessages
from app.core.exceptions import ScheduleExceptions
from app.models.users_model import User
from app.models.schedules_model import DefaultSchedule
from app.schemas.schedules_schema import DefaultScheduleBase


def get_or_create_default_schedules(
    db: Session, *, user_id: uuid.UUID
) -> List[DefaultSchedule]:
    """
    Lấy lịch làm việc mặc định của user.
    Nếu user chưa có lịch, tự động tạo 7 ngày mặc định (không active).
    """
    # Kiểm tra user có tồn tại không
    user = db.get(User, user_id)
    if not user:
        raise ScheduleExceptions.user_not_found()

    schedules = db.exec(
        select(DefaultSchedule)
        .where(DefaultSchedule.user_id == user_id)
        .order_by(DefaultSchedule.day_of_week)
    ).all()

    # Nếu chưa có lịch, tạo mới
    if not schedules:
        new_schedules = []
        for day in range(1, 8):
            schedule = DefaultSchedule(
                user_id=user_id, day_of_week=day, is_active=False
            )
            db.add(schedule)
            new_schedules.append(schedule)
        db.commit()
        # Refresh để lấy lại đối tượng từ DB
        for schedule in new_schedules:
            db.refresh(schedule)
        return new_schedules

    return schedules


def update_default_schedules(
    db: Session, *, user_id: uuid.UUID, schedules_in: List[DefaultScheduleBase]
) -> List[DefaultSchedule]:
    """
    Cập nhật hoặc tạo mới (upsert) toàn bộ lịch mặc định trong tuần cho user.
    """
    # Lấy lịch hiện tại hoặc tạo mới nếu chưa có
    db_schedules_list = get_or_create_default_schedules(db=db, user_id=user_id)
    db_schedules_map = {s.day_of_week: s for s in db_schedules_list}

    if len(schedules_in) != 7:
        raise ScheduleExceptions.invalid_schedule_count()

    for schedule_in in schedules_in:
        db_schedule = db_schedules_map.get(schedule_in.day_of_week)
        if db_schedule:
            update_data = schedule_in.model_dump()
            for key, value in update_data.items():
                setattr(db_schedule, key, value)
            db.add(db_schedule)

    db.commit()

    # Sắp xếp lại list trả về theo đúng thứ tự ngày trong tuần
    updated_schedules = sorted(db_schedules_list, key=lambda s: s.day_of_week)
    for schedule in updated_schedules:
        db.refresh(schedule)

    return updated_schedules
