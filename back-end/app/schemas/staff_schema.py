# back-end/app/schemas/staff_schema.py
import datetime
import uuid
from typing import List

from pydantic import Field
from sqlmodel import SQLModel

from app.models.staff_model import EmploymentStatus, StaffTimeOffStatus
from app.schemas.services_schema import ServicePublic


class StaffProfileBase(SQLModel):
    # SỬA LỖI: Thêm full_name làm trường bắt buộc
    full_name: str = Field(max_length=100)
    user_id: uuid.UUID
    phone_number: str = Field(max_length=20)
    position: str | None = None
    hire_date: datetime.date | None = None
    employment_status: EmploymentStatus = EmploymentStatus.ACTIVE
    notes: str | None = None


class StaffProfileCreate(StaffProfileBase):
    pass


class StaffProfileUpdate(SQLModel):
    full_name: str | None = Field(default=None, max_length=100)
    phone_number: str | None = Field(default=None, max_length=20)
    position: str | None = None
    hire_date: datetime.date | None = None
    employment_status: EmploymentStatus | None = None
    notes: str | None = None


class StaffProfilePublic(SQLModel):
    id: uuid.UUID
    user_id: uuid.UUID
    full_name: str
    phone_number: str
    position: str | None = None
    hire_date: datetime.date | None = None
    employment_status: EmploymentStatus
    notes: str | None = None
    user_email: str
    user_is_active: bool


class StaffProfileWithServices(StaffProfilePublic):
    services: List[ServicePublic] = []


class StaffServiceAssignment(SQLModel):
    service_ids: List[uuid.UUID] = []


class StaffScheduleBase(SQLModel):
    day_of_week: int | None = Field(
        default=None, ge=1, le=7, description="1: Thứ Hai ... 7: Chủ Nhật"
    )
    specific_date: datetime.date | None = Field(default=None)
    start_time: datetime.time
    end_time: datetime.time
    is_active: bool = True
    note: str | None = None


class StaffScheduleCreate(StaffScheduleBase):
    pass


class StaffScheduleUpdate(SQLModel):
    start_time: datetime.time | None = None
    end_time: datetime.time | None = None
    is_active: bool | None = None
    note: str | None = None


class StaffSchedulePublic(StaffScheduleBase):
    id: uuid.UUID
    staff_id: uuid.UUID


class StaffTimeOffBase(SQLModel):
    start_date: datetime.date
    end_date: datetime.date
    reason: str | None = None


class StaffTimeOffCreate(StaffTimeOffBase):
    staff_id: uuid.UUID | None = Field(
        default=None,
        description="ID của nhân viên xin nghỉ (admin có thể chỉ định)",
    )


class StaffTimeOffUpdateStatus(SQLModel):
    status: StaffTimeOffStatus
    decision_note: str | None = None


class StaffTimeOffPublic(StaffTimeOffBase):
    id: uuid.UUID
    staff_id: uuid.UUID
    status: StaffTimeOffStatus
    approver_id: uuid.UUID | None = None
    decision_note: str | None = None


class FutureAppointmentInfo(SQLModel):
    appointment_id: uuid.UUID
    customer_name: str
    appointment_time: datetime.datetime


class StaffOffboardingResult(SQLModel):
    staff_profile: StaffProfilePublic
    future_appointments: List[FutureAppointmentInfo] = []
