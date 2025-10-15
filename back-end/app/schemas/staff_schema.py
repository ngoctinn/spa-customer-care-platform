# back-end/app/schemas/staff_schema.py
import datetime
import uuid
from typing import List, Optional

from pydantic import Field
from sqlmodel import SQLModel

from app.models.staff_model import EmploymentStatus, StaffTimeOffStatus
from app.schemas.services_schema import ServicePublic


class StaffProfileBase(SQLModel):
    # SỬA LỖI: Thêm full_name làm trường bắt buộc
    full_name: str = Field(max_length=100)
    user_id: uuid.UUID
    phone_number: str = Field(max_length=20)
    position: Optional[str] = None
    hire_date: Optional[datetime.date] = None
    employment_status: EmploymentStatus = EmploymentStatus.ACTIVE
    notes: Optional[str] = None


class StaffProfileCreate(StaffProfileBase):
    pass


class StaffProfileUpdate(SQLModel):
    full_name: Optional[str] = Field(default=None, max_length=100)
    phone_number: Optional[str] = Field(default=None, max_length=20)
    position: Optional[str] = None
    hire_date: Optional[datetime.date] = None
    employment_status: Optional[EmploymentStatus] = None
    notes: Optional[str] = None


class StaffProfilePublic(SQLModel):
    id: uuid.UUID
    user_id: uuid.UUID
    full_name: str
    phone_number: str
    position: Optional[str] = None
    hire_date: Optional[datetime.date] = None
    employment_status: EmploymentStatus
    notes: Optional[str] = None
    user_email: str
    user_is_active: bool


class StaffProfileWithServices(StaffProfilePublic):
    services: List[ServicePublic] = []


class StaffServiceAssignment(SQLModel):
    service_ids: List[uuid.UUID] = []


class StaffScheduleBase(SQLModel):
    day_of_week: Optional[int] = Field(
        default=None, ge=1, le=7, description="1: Thứ Hai ... 7: Chủ Nhật"
    )
    specific_date: Optional[datetime.date] = Field(default=None)
    start_time: datetime.time
    end_time: datetime.time
    is_active: bool = True
    note: Optional[str] = None


class StaffScheduleCreate(StaffScheduleBase):
    pass


class StaffScheduleUpdate(SQLModel):
    start_time: Optional[datetime.time] = None
    end_time: Optional[datetime.time] = None
    is_active: Optional[bool] = None
    note: Optional[str] = None


class StaffSchedulePublic(StaffScheduleBase):
    id: uuid.UUID
    staff_id: uuid.UUID


class StaffTimeOffBase(SQLModel):
    start_date: datetime.date
    end_date: datetime.date
    reason: Optional[str] = None


class StaffTimeOffCreate(StaffTimeOffBase):
    staff_id: Optional[uuid.UUID] = Field(
        default=None,
        description="ID của nhân viên xin nghỉ (admin có thể chỉ định)",
    )


class StaffTimeOffUpdateStatus(SQLModel):
    status: StaffTimeOffStatus
    decision_note: Optional[str] = None


class StaffTimeOffPublic(StaffTimeOffBase):
    id: uuid.UUID
    staff_id: uuid.UUID
    status: StaffTimeOffStatus
    approver_id: Optional[uuid.UUID] = None
    decision_note: Optional[str] = None


class FutureAppointmentInfo(SQLModel):
    appointment_id: uuid.UUID
    customer_name: str
    appointment_time: datetime.datetime


class StaffOffboardingResult(SQLModel):
    staff_profile: StaffProfilePublic
    future_appointments: List[FutureAppointmentInfo] = []
