# app/schemas/staff_schema.py
from __future__ import annotations
import datetime
import uuid
from typing import List, Optional, Annotated

from pydantic import (
    model_validator,
    field_validator,
    StringConstraints,
)
from sqlmodel import SQLModel, Field

from app.models.staff_model import EmploymentStatus, ScheduleType, StaffTimeOffStatus
from app.schemas.services_schema import ServicePublic


PHONE_REGEX = r"^(0|\+84)(\s|\.)?((3[2-9])|(5[689])|(7[06-9])|(8[1-689])|(9[0-46-9]))(\d)(\s|\.)?(\d{3})(\s|\.)?(\d{3})$"
PhoneNumber = Annotated[str, StringConstraints(max_length=20, pattern=PHONE_REGEX)]

# =================================================================
# SCHEMAS FOR STAFF PROFILE
# =================================================================


class StaffProfileBase(SQLModel):

    phone_number: PhoneNumber = Field(description="Số điện thoại liên hệ của nhân viên")

    position: Optional[str] = Field(
        default=None, description="Chức danh/Vị trí làm việc"
    )
    hire_date: Optional[datetime.date] = Field(
        default=None, description="Ngày bắt đầu làm việc"
    )
    employment_status: EmploymentStatus = Field(
        default=EmploymentStatus.ACTIVE, description="Trạng thái làm việc hiện tại"
    )
    notes: Optional[str] = Field(default=None, description="Ghi chú nội bộ")


class StaffProfileCreate(StaffProfileBase):
    user_id: uuid.UUID


class StaffProfileUpdate(SQLModel):

    phone_number: Optional[PhoneNumber] = None

    position: Optional[str] = None
    hire_date: Optional[datetime.date] = None
    employment_status: Optional[EmploymentStatus] = None
    notes: Optional[str] = None


class StaffProfilePublic(StaffProfileBase):
    id: uuid.UUID
    user_id: uuid.UUID
    user_full_name: str
    user_email: str
    user_is_active: bool


class StaffProfileWithServices(StaffProfilePublic):
    services: List[ServicePublic] = Field(default_factory=list)


class StaffServiceAssignment(SQLModel):
    service_ids: List[uuid.UUID] = Field(
        description="Danh sách ID dịch vụ nhân viên có thể thực hiện"
    )


# ... (Phần còn lại của file giữ nguyên, không cần thay đổi) ...

# =================================================================
# SCHEMAS FOR STAFF SCHEDULE
# =================================================================


class StaffScheduleBase(SQLModel):
    day_of_week: Optional[int] = Field(
        None, ge=1, le=7, description="1: T2 ... 7: CN (cho ca lặp lại)"
    )
    specific_date: Optional[datetime.date] = Field(
        None, description="Ngày cụ thể cho ca đặc biệt"
    )
    start_time: datetime.time
    end_time: datetime.time
    is_active: bool = True
    schedule_type: ScheduleType = Field(default=ScheduleType.WORKING)
    note: Optional[str] = None

    @model_validator(mode="after")
    def validate_dates_and_times(self) -> "StaffScheduleBase":
        if self.day_of_week is None and self.specific_date is None:
            raise ValueError("Cần cung cấp day_of_week hoặc specific_date")
        if self.day_of_week is not None and self.specific_date is not None:
            raise ValueError(
                "Chỉ được chọn một trong hai: day_of_week hoặc specific_date"
            )
        if self.start_time >= self.end_time:
            raise ValueError("end_time phải lớn hơn start_time")
        return self


class StaffScheduleCreate(StaffScheduleBase):
    pass


class StaffScheduleUpdate(SQLModel):
    day_of_week: Optional[int] = Field(None, ge=1, le=7)
    specific_date: Optional[datetime.date] = None
    start_time: Optional[datetime.time] = None
    end_time: Optional[datetime.time] = None
    is_active: Optional[bool] = None
    schedule_type: Optional[ScheduleType] = None
    note: Optional[str] = None

    @model_validator(mode="after")
    def validate_updates(self) -> "StaffScheduleUpdate":
        return self


class StaffSchedulePublic(StaffScheduleBase):
    id: uuid.UUID
    staff_id: uuid.UUID


class StaffScheduleCollection(SQLModel):
    schedules: List[StaffScheduleCreate]


# =================================================================
# SCHEMAS FOR STAFF TIME OFF
# =================================================================


class StaffTimeOffBase(SQLModel):
    start_date: datetime.date
    end_date: datetime.date
    reason: Optional[str] = None

    @field_validator("end_date")
    def validate_range(cls, v, values):
        if "start_date" in values.data and v < values.data["start_date"]:
            raise ValueError("end_date phải lớn hơn hoặc bằng start_date")
        return v


class StaffTimeOffCreate(StaffTimeOffBase):
    staff_id: Optional[uuid.UUID] = Field(
        None, description="ID nhân viên (dùng khi admin tạo hộ)"
    )


class StaffTimeOffUpdateStatus(SQLModel):
    status: StaffTimeOffStatus
    decision_note: Optional[str] = None


class StaffTimeOffPublic(StaffTimeOffBase):
    id: uuid.UUID
    staff_id: uuid.UUID
    status: StaffTimeOffStatus
    approver_id: Optional[uuid.UUID] = None
    approved_at: Optional[datetime.datetime] = None
    decision_note: Optional[str] = None


# =================================================================
# SCHEMAS FOR OFFBOARDING
# =================================================================
class FutureAppointmentInfo(SQLModel):
    appointment_id: uuid.UUID
    scheduled_start: datetime.datetime
    scheduled_end: datetime.datetime
    service_id: uuid.UUID
    customer_id: uuid.UUID


class StaffOffboardingResult(SQLModel):
    staff_profile: StaffProfilePublic
    future_appointments: List[FutureAppointmentInfo] = Field(default_factory=list)
