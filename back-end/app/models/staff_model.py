# app/models/staff_model.py
import uuid
import datetime
from typing import TYPE_CHECKING, List, Optional
from enum import Enum

from sqlmodel import Field, Relationship, SQLModel, UniqueConstraint

from app.models.base_model import BaseUUIDModel

if TYPE_CHECKING:
    from app.models.users_model import User
    from app.models.services_model import Service

# --- Bảng liên kết Many-to-Many ---


class StaffServiceLink(SQLModel, table=True):
    __tablename__ = "staff_service_link"
    staff_id: uuid.UUID = Field(foreign_key="staff_profile.id", primary_key=True)
    service_id: uuid.UUID = Field(foreign_key="service.id", primary_key=True)


# --- Enums ---


class EmploymentStatus(str, Enum):
    """Trạng thái làm việc của nhân viên."""

    PROBATION = "thu_viec"
    ACTIVE = "dang_lam_viec"
    SUSPENDED = "tam_ngung"
    RESIGNED = "da_nghi_viec"


# --- Bảng chính ---


class StaffProfile(BaseUUIDModel, table=True):
    """Hồ sơ nhân viên, gắn với một tài khoản người dùng."""

    __tablename__ = "staff_profile"

    user_id: uuid.UUID = Field(foreign_key="user.id", unique=True, index=True)
    phone_number: str = Field(max_length=20, unique=True, index=True)
    position: Optional[str] = Field(
        default=None, description="Chức danh/Vị trí làm việc"
    )
    hire_date: Optional[datetime.date] = Field(
        default=None, description="Ngày bắt đầu làm việc"
    )
    employment_status: EmploymentStatus = Field(
        default=EmploymentStatus.PROBATION,
        nullable=False,
        description="Trạng thái làm việc hiện tại",
    )
    notes: Optional[str] = Field(default=None, description="Ghi chú nội bộ khác")

    # Mối quan hệ One-to-One ngược lại với User
    user: "User" = Relationship(back_populates="staff_profile")

    # Mối quan hệ Many-to-Many với Service
    services: List["Service"] = Relationship(
        back_populates="staff_members", link_model=StaffServiceLink
    )

    # Mối quan hệ One-to-Many với Lịch làm việc
    schedules: List["StaffSchedule"] = Relationship(
        back_populates="staff", sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )

    # Mối quan hệ One-to-Many với Đơn nghỉ phép
    time_off_requests: List["StaffTimeOff"] = Relationship(
        back_populates="staff", sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )


class ScheduleType(str, Enum):
    """Phân loại ca làm việc để dễ dàng lọc và xử lý."""

    WORKING = "working"  # Ca làm việc bình thường (lặp lại hoặc cố định)
    TIME_OFF = "time_off"  # Ca nghỉ đã được duyệt
    OVERRIDE = "override"  # Ca làm bù, thay đổi đột xuất


class StaffSchedule(BaseUUIDModel, table=True):
    """Ca làm việc của nhân viên."""

    __tablename__ = "staff_schedule"
    __table_args__ = (
        UniqueConstraint(
            "staff_id", "day_of_week", "schedule_type", name="uq_staff_weekly_schedule"
        ),
    )

    staff_id: uuid.UUID = Field(foreign_key="staff_profile.id", index=True)

    # Dùng cho ca lặp lại hàng tuần
    day_of_week: Optional[int] = Field(
        default=None, ge=1, le=7, description="1: Thứ Hai ... 7: Chủ Nhật"
    )

    # Dùng cho ca đặc biệt (nghỉ, làm bù)
    specific_date: Optional[datetime.date] = Field(default=None)

    start_time: datetime.time = Field(description="Giờ bắt đầu ca")
    end_time: datetime.time = Field(description="Giờ kết thúc ca")

    is_active: bool = Field(default=True, description="Ca này có hiệu lực hay không")

    schedule_type: ScheduleType = Field(
        default=ScheduleType.WORKING, description="Phân loại ca"
    )
    note: Optional[str] = Field(default=None, description="Ghi chú chi tiết cho ca")

    staff: "StaffProfile" = Relationship(back_populates="schedules")


class StaffTimeOffStatus(str, Enum):
    """Trạng thái xử lý của đơn xin nghỉ phép."""

    PENDING = "cho_duyet"
    APPROVED = "da_duyet"
    REJECTED = "tu_choi"


class StaffTimeOff(BaseUUIDModel, table=True):
    """Đơn xin nghỉ phép của nhân viên."""

    __tablename__ = "staff_time_off"

    staff_id: uuid.UUID = Field(foreign_key="staff_profile.id", index=True)
    start_date: datetime.date = Field(description="Ngày bắt đầu nghỉ")
    end_date: datetime.date = Field(description="Ngày kết thúc nghỉ")
    reason: Optional[str] = Field(default=None, description="Lý do xin nghỉ")

    status: StaffTimeOffStatus = Field(
        default=StaffTimeOffStatus.PENDING, nullable=False
    )

    # Thông tin người duyệt
    approver_id: Optional[uuid.UUID] = Field(default=None, foreign_key="user.id")
    approved_at: Optional[datetime.datetime] = Field(default=None)
    decision_note: Optional[str] = Field(
        default=None, description="Ghi chú của người duyệt"
    )

    staff: "StaffProfile" = Relationship(back_populates="time_off_requests")
    approver: Optional["User"] = Relationship(
        sa_relationship_kwargs={"lazy": "selectin"}
    )
