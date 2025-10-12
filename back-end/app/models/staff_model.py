# app/models/staff_model.py
"""Định nghĩa các bảng dữ liệu phục vụ nghiệp vụ quản lý nhân viên."""

from __future__ import annotations
import datetime as dt
import uuid
from enum import Enum
from typing import List, Optional, TYPE_CHECKING

from sqlalchemy import UniqueConstraint
from sqlmodel import Field, Relationship

from app.models.association_tables import StaffServiceLink
from app.models.base_model import BaseUUIDModel

if TYPE_CHECKING:  # Tránh vòng lặp import khi khai báo Relationship
    from app.models.services_model import Service
    from app.models.users_model import User


class EmploymentStatus(str, Enum):
    """Trạng thái làm việc của nhân viên."""

    PROBATION = "thu_viec"
    ACTIVE = "dang_lam_viec"
    SUSPENDED = "tam_ngung"
    RESIGNED = "da_nghi_viec"


class StaffProfile(BaseUUIDModel, table=True):
    """Hồ sơ nhân viên, gắn với một tài khoản người dùng."""

    __tablename__ = "staff_profile"

    user_id: uuid.UUID = Field(foreign_key="user.id", unique=True, index=True)
    phone_number: str = Field(max_length=20, index=True)
    position: str = Field(max_length=100, description="Chức danh/Vị trí làm việc")
    hire_date: dt.date = Field(description="Ngày bắt đầu làm việc")
    employment_status: EmploymentStatus = Field(
        default=EmploymentStatus.ACTIVE,
        description="Trạng thái làm việc của nhân viên",
    )
    skills_summary: str | None = Field(
        default=None,
        description="Ghi chú ngắn gọn về kỹ năng nổi bật",
    )
    notes: str | None = Field(
        default=None,
        description="Ghi chú nội bộ khác (ví dụ: ca làm ưu tiên)",
    )

    user: "User" = Relationship(back_populates="staff_profile")
    services: List["Service"] = Relationship(
        back_populates="staff_members", link_model=StaffServiceLink
    )
    schedules: List["StaffSchedule"] = Relationship(
        back_populates="staff",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
    time_off_requests: List["StaffTimeOff"] = Relationship(
        back_populates="staff",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class ScheduleType(str, Enum):
    """Phân loại ca làm việc để dễ dàng lọc và xử lý."""

    WORKING = "working"
    TIME_OFF = "time_off"
    OVERRIDE = "override"


class StaffSchedule(BaseUUIDModel, table=True):
    """Ca làm việc của nhân viên."""

    __tablename__ = "staff_schedule"
    __table_args__ = (
        UniqueConstraint(
            "staff_id",
            "day_of_week",
            "schedule_type",
            name="uq_staff_weekly_schedule",
        ),
    )

    staff_id: uuid.UUID = Field(foreign_key="staff_profile.id", index=True)
    day_of_week: int | None = Field(
        default=None,
        ge=1,
        le=7,
        description="Thứ trong tuần (1: Thứ Hai ... 7: Chủ Nhật) cho ca lặp lại",
    )
    specific_date: dt.date | None = Field(
        default=None, description="Ngày cụ thể cho ca đặc biệt"
    )
    start_time: dt.time = Field(description="Giờ bắt đầu ca")
    end_time: dt.time = Field(description="Giờ kết thúc ca")
    is_active: bool = Field(default=True, description="Ca này có hiệu lực hay không")
    is_recurring: bool = Field(
        default=True,
        description="Ca này có lặp lại hàng tuần hay chỉ áp dụng một lần",
    )
    schedule_type: ScheduleType = Field(
        default=ScheduleType.WORKING,
        description="Phân loại ca (làm việc, nghỉ phép, điều chỉnh)",
    )
    note: str | None = Field(default=None, description="Ghi chú chi tiết cho ca")

    staff: StaffProfile = Relationship(back_populates="schedules")


class StaffTimeOffStatus(str, Enum):
    """Trạng thái xử lý của đơn xin nghỉ phép."""

    PENDING = "cho_duyet"
    APPROVED = "da_duyet"
    REJECTED = "tu_choi"


class StaffTimeOff(BaseUUIDModel, table=True):
    """Đơn xin nghỉ phép của nhân viên."""

    __tablename__ = "staff_time_off"

    staff_id: uuid.UUID = Field(foreign_key="staff_profile.id", index=True)
    start_date: dt.date = Field(description="Ngày bắt đầu nghỉ")
    end_date: dt.date = Field(description="Ngày kết thúc nghỉ")
    reason: str = Field(description="Lý do xin nghỉ")
    status: StaffTimeOffStatus = Field(default=StaffTimeOffStatus.PENDING)
    approver_id: uuid.UUID | None = Field(
        default=None, foreign_key="user.id", description="Người duyệt đơn"
    )
    approved_at: dt.datetime | None = Field(default=None)
    decision_note: str | None = Field(
        default=None, description="Ghi chú của người duyệt"
    )

    staff: StaffProfile = Relationship(back_populates="time_off_requests")
    approver: Optional["User"] = Relationship(sa_relationship_kwargs={"lazy": "selectin"})
