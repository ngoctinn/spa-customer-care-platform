# app/models/schedules_model.py
from __future__ import annotations

import datetime
import uuid
from typing import TYPE_CHECKING

from sqlalchemy.orm import Mapped
from sqlmodel import Field, Relationship

from app.models.base_model import BaseUUIDModel

if TYPE_CHECKING:
    from app.models.users_model import User


class DefaultSchedule(BaseUUIDModel, table=True):
    __tablename__ = "default_schedule"

    user_id: uuid.UUID = Field(foreign_key="user.id", index=True)
    day_of_week: int = Field(nullable=False, description="1: Thứ Hai, ..., 7: Chủ Nhật")

    is_active: bool = Field(default=False, description="Ngày này có làm việc không")
    start_time: datetime.time | None = Field(
        default=None, description="Giờ bắt đầu làm việc"
    )
    end_time: datetime.time | None = Field(
        default=None, description="Giờ kết thúc làm việc"
    )

    # ✅ updated for SQLAlchemy 2.0
    # Mối quan hệ nhiều-một: nhiều lịch mặc định thuộc về một User
    user: Mapped["User"] = Relationship(back_populates="default_schedules")
