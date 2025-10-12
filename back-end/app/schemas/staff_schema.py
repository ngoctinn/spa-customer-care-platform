# app/schemas/staff_schema.py
"""Schema cho các API quản lý nhân viên."""

from __future__ import annotations

import datetime as dt
import uuid
from typing import List

from pydantic import Field, model_validator
from sqlmodel import SQLModel

from app.models.staff_model import (
    EmploymentStatus,
    ScheduleType,
    StaffTimeOffStatus,
)
from app.schemas.services_schema import ServicePublic


class StaffProfileBase(SQLModel):
    phone_number: str = Field(
        max_length=20,
        pattern=r"^(0|\+84)(\s|\.)?((3[2-9])|(5[689])|(7[06-9])|(8[1-689])|(9[0-46-9]))(\d)(\s|\.)?(\d{3})(\s|\.)?(\d{3})$",
        description="Số điện thoại liên hệ của nhân viên",
    )
    position: str = Field(max_length=100)
    hire_date: dt.date
    employment_status: EmploymentStatus = Field(
        default=EmploymentStatus.ACTIVE,
        description="Trạng thái làm việc hiện tại",
    )
    skills_summary: str | None = Field(default=None)
    notes: str | None = Field(default=None)


class StaffProfileCreate(StaffProfileBase):
    user_id: uuid.UUID


class StaffProfileUpdate(SQLModel):
    phone_number: str | None = Field(default=None, max_length=20)
    position: str | None = Field(default=None, max_length=100)
    hire_date: dt.date | None = None
    employment_status: EmploymentStatus | None = None
    skills_summary: str | None = None
    notes: str | None = None


class StaffProfilePublic(StaffProfileBase):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    user_id: uuid.UUID
    user_full_name: str | None = None
    user_email: str | None = None
    user_is_active: bool = True


class StaffProfileWithServices(StaffProfilePublic):
    services: List[ServicePublic] = Field(default_factory=list)


class StaffServiceAssignment(SQLModel):
    service_ids: List[uuid.UUID] = Field(
        default_factory=list, description="Danh sách dịch vụ nhân viên có thể thực hiện"
    )


class StaffScheduleBase(SQLModel):
    day_of_week: int | None = Field(default=None, ge=1, le=7)
    specific_date: dt.date | None = Field(default=None)
    start_time: dt.time
    end_time: dt.time
    is_active: bool = Field(default=True)
    is_recurring: bool = Field(default=True)
    schedule_type: ScheduleType = Field(default=ScheduleType.WORKING)
    note: str | None = None

    @model_validator(mode="after")
    def validate_dates(cls, values: "StaffScheduleBase") -> "StaffScheduleBase":
        if values.day_of_week is None and values.specific_date is None:
            raise ValueError("Cần cung cấp day_of_week hoặc specific_date cho ca làm")
        if values.day_of_week is not None and values.specific_date is not None:
            raise ValueError(
                "Chỉ được chọn một trong hai: day_of_week cho ca lặp lại hoặc specific_date cho ca đặc biệt"
            )
        if values.end_time <= values.start_time:
            raise ValueError("end_time phải lớn hơn start_time")
        return values


class StaffScheduleCreate(StaffScheduleBase):
    pass


class StaffScheduleUpdate(SQLModel):
    day_of_week: int | None = Field(default=None, ge=1, le=7)
    specific_date: dt.date | None = None
    start_time: dt.time | None = None
    end_time: dt.time | None = None
    is_active: bool | None = None
    is_recurring: bool | None = None
    schedule_type: ScheduleType | None = None
    note: str | None = None

    @model_validator(mode="after")
    def validate_dates(cls, values: "StaffScheduleUpdate") -> "StaffScheduleUpdate":
        if (
            values.start_time is not None
            and values.end_time is not None
            and values.end_time <= values.start_time
        ):
            raise ValueError("end_time phải lớn hơn start_time")
        if (
            values.day_of_week is not None
            and values.specific_date is not None
        ):
            raise ValueError(
                "Không thể vừa cập nhật day_of_week vừa chọn specific_date cho cùng một ca"
            )
        return values


class StaffSchedulePublic(StaffScheduleBase):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    staff_id: uuid.UUID


class StaffScheduleCollection(SQLModel):
    staff: StaffProfilePublic
    schedules: List[StaffSchedulePublic] = Field(default_factory=list)
    time_off: List["StaffTimeOffPublic"] = Field(default_factory=list)


class StaffScheduleBulkCreate(SQLModel):
    schedules: List[StaffScheduleCreate]


class StaffTimeOffBase(SQLModel):
    start_date: dt.date
    end_date: dt.date
    reason: str

    @model_validator(mode="after")
    def validate_range(cls, values: "StaffTimeOffBase") -> "StaffTimeOffBase":
        if values.end_date < values.start_date:
            raise ValueError("end_date phải lớn hơn hoặc bằng start_date")
        return values


class StaffTimeOffCreate(StaffTimeOffBase):
    staff_id: uuid.UUID | None = Field(
        default=None, description="ID nhân viên (dùng khi admin tạo hộ)"
    )


class StaffTimeOffUpdateStatus(SQLModel):
    status: StaffTimeOffStatus
    decision_note: str | None = None


class StaffTimeOffPublic(StaffTimeOffBase):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    staff_id: uuid.UUID
    status: StaffTimeOffStatus
    approver_id: uuid.UUID | None = None
    approved_at: dt.datetime | None = None
    decision_note: str | None = None


class FutureAppointmentInfo(SQLModel):
    appointment_id: uuid.UUID
    scheduled_start: dt.datetime
    scheduled_end: dt.datetime
    service_id: uuid.UUID | None = None
    customer_id: uuid.UUID | None = None
    note: str | None = None


class StaffOffboardingResult(SQLModel):
    staff: StaffProfilePublic
    future_appointments: List[FutureAppointmentInfo] = Field(default_factory=list)


StaffScheduleCollection.model_rebuild()
