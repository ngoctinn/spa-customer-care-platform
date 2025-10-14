# app/services/staff_service.py
"""Business logic cho nghiệp vụ quản lý nhân viên."""
from __future__ import annotations
import datetime
import uuid
from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy import and_, or_
from sqlalchemy.orm import selectinload, Load
from sqlmodel import Session, select

from app.core.messages import StaffMessages
from app.models.services_model import Service
from app.models.staff_model import (
    EmploymentStatus,
    ScheduleType,
    StaffProfile,
    StaffSchedule,
    StaffTimeOff,
    StaffTimeOffStatus,
)
from app.models.users_model import User
from app.schemas.services_schema import ServicePublic
from app.schemas.staff_schema import (
    FutureAppointmentInfo,
    StaffOffboardingResult,
    StaffProfileCreate,
    StaffProfilePublic,
    StaffProfileUpdate,
    StaffProfileWithServices,
    StaffScheduleCreate,
    StaffSchedulePublic,
    StaffScheduleUpdate,
    StaffServiceAssignment,
    StaffTimeOffCreate,
    StaffTimeOffPublic,
    StaffTimeOffUpdateStatus,
)
from .base_service import BaseService


class StaffService(BaseService[StaffProfile, StaffProfileCreate, StaffProfileUpdate]):
    def __init__(self):
        super().__init__(StaffProfile)

    # --- Helper Serialization Functions (Moved inside class) ---
    def _serialize_staff_profile(self, staff: StaffProfile) -> StaffProfilePublic:
        """Helper để tạo StaffProfilePublic từ model, bao gồm thông tin user."""
        return StaffProfilePublic(
            id=staff.id,
            user_id=staff.user_id,
            # THAY ĐỔI: Lấy full_name trực tiếp từ staff
            full_name=staff.full_name,
            phone_number=staff.phone_number,
            position=staff.position,
            hire_date=staff.hire_date,
            employment_status=staff.employment_status,
            notes=staff.notes,
            # THAY ĐỔI: Đổi tên field cho nhất quán
            user_email=staff.user.email,
            user_is_active=staff.user.is_active,
        )

    def _serialize_staff_with_services(
        self, profile: StaffProfile
    ) -> StaffProfileWithServices:
        """Helper để tạo StaffProfileWithServices."""
        profile_data = self._serialize_staff_profile(profile).model_dump()
        services = [
            ServicePublic.model_validate(service)
            for service in profile.services
            if not service.is_deleted
        ]
        return StaffProfileWithServices(**profile_data, services=services)

    def _get_load_options(self) -> List[Load]:
        return [
            selectinload(StaffProfile.user),
            selectinload(StaffProfile.services),
            selectinload(StaffProfile.schedules),
            selectinload(StaffProfile.time_off_requests),
        ]

    def _ensure_user_exists(self, db: Session, user_id: uuid.UUID) -> User:
        user = db.get(User, user_id)
        if not user:
            raise HTTPException(
                status_code=404, detail=StaffMessages.STAFF_USER_NOT_FOUND
            )
        return user

    def _get_staff_by_user_id(
        self, db: Session, user_id: uuid.UUID
    ) -> Optional[StaffProfile]:
        statement = (
            select(StaffProfile)
            .where(StaffProfile.user_id == user_id)
            .options(*self._get_load_options())
        )
        return db.exec(statement).first()

    # --- Staff Profile Logic ---

    def list_staff_profiles(
        self, db: Session, skip: int = 0, limit: int = 100
    ) -> List[StaffProfilePublic]:
        staff_list = self.get_all(db, skip=skip, limit=limit)
        return [self._serialize_staff_profile(staff) for staff in staff_list]

    def get_staff_profile_by_user(
        self, db: Session, user_id: uuid.UUID
    ) -> StaffProfilePublic:
        profile = self._get_staff_by_user_id(db, user_id)
        if not profile:
            raise HTTPException(
                status_code=404, detail=StaffMessages.STAFF_PROFILE_NOT_FOUND
            )
        return self._serialize_staff_profile(profile)

    def get_staff_profile_detail(
        self, db: Session, staff_id: uuid.UUID
    ) -> StaffProfileWithServices:
        staff = self.get_by_id(db, id=staff_id)
        return self._serialize_staff_with_services(staff)

    def update_staff_profile(
        self, db: Session, staff_id: uuid.UUID, data: StaffProfileUpdate
    ) -> StaffProfilePublic:
        db_profile = self.get_by_id(db, id=staff_id)
        updated_profile = self.update(db, db_obj=db_profile, obj_in=data)
        return self._serialize_staff_profile(updated_profile)

    def assign_services_to_staff(
        self, db: Session, staff_id: uuid.UUID, assignment: StaffServiceAssignment
    ) -> StaffProfileWithServices:
        db_profile = self.get_by_id(db, id=staff_id)
        db.refresh(db_profile, attribute_names=["services"])

        if not assignment.service_ids:
            db_profile.services = []
        else:
            services = db.exec(
                select(Service).where(Service.id.in_(assignment.service_ids))
            ).all()
            if len(services) != len(set(assignment.service_ids)):
                raise HTTPException(
                    status_code=404, detail=StaffMessages.STAFF_SERVICE_NOT_FOUND
                )
            db_profile.services = services

        db.add(db_profile)
        db.commit()
        db.refresh(db_profile)
        return self._serialize_staff_with_services(db_profile)

    # --- Staff Schedule Logic ---

    def set_weekly_schedules(
        self, db: Session, staff_id: uuid.UUID, payload: List[StaffScheduleCreate]
    ) -> List[StaffSchedulePublic]:
        self.get_by_id(db, id=staff_id)

        # << THAY ĐỔI: Sửa DeprecationWarning >>
        old_schedules = db.exec(
            select(StaffSchedule).where(
                StaffSchedule.staff_id == staff_id,
                StaffSchedule.schedule_type == ScheduleType.WORKING,
            )
        ).all()
        for s in old_schedules:
            db.delete(s)

        new_schedules = []
        for schedule_data in payload:
            if schedule_data.day_of_week is None:
                raise HTTPException(
                    status_code=400,
                    detail=StaffMessages.STAFF_SCHEDULE_RECURRING_REQUIRE_DAY,
                )

            new_schedule = StaffSchedule(
                **schedule_data.model_dump(), staff_id=staff_id
            )
            db.add(new_schedule)
            new_schedules.append(new_schedule)

        db.commit()
        return [StaffSchedulePublic.model_validate(s) for s in new_schedules]

    def update_staff_schedule(
        self, db: Session, schedule_id: uuid.UUID, payload: StaffScheduleUpdate
    ) -> StaffSchedulePublic:
        db_schedule = db.get(StaffSchedule, schedule_id)
        if not db_schedule:
            raise HTTPException(
                status_code=404, detail=StaffMessages.STAFF_SCHEDULE_NOT_FOUND
            )

        update_data = payload.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_schedule, field, value)

        db.add(db_schedule)
        db.commit()
        db.refresh(db_schedule)
        return StaffSchedulePublic.model_validate(db_schedule)

    # --- Staff Time Off Logic ---

    def create_time_off_request(
        self, db: Session, requester: User, data: StaffTimeOffCreate
    ) -> StaffTimeOffPublic:
        staff_id = data.staff_id or (
            requester.staff_profile.id if requester.staff_profile else None
        )
        if not staff_id:
            raise HTTPException(
                status_code=400,
                detail="Cần cung cấp staff_id hoặc đăng nhập bằng tài khoản nhân viên",
            )

        self.get_by_id(db, id=staff_id)

        request_data = data.model_dump(exclude={"staff_id"})
        db_request = StaffTimeOff(**request_data, staff_id=staff_id)

        db.add(db_request)
        db.commit()
        db.refresh(db_request)
        return StaffTimeOffPublic.model_validate(db_request)

    def update_time_off_status(
        self,
        db: Session,
        request_id: uuid.UUID,
        approver: User,
        data: StaffTimeOffUpdateStatus,
    ) -> StaffTimeOffPublic:
        db_request = db.get(StaffTimeOff, request_id)
        if not db_request:
            raise HTTPException(
                status_code=404, detail=StaffMessages.STAFF_TIME_OFF_REQUEST_NOT_FOUND
            )

        db_request.status = data.status
        db_request.approver_id = approver.id
        db_request.approved_at = datetime.datetime.now(datetime.timezone.utc)
        db_request.decision_note = data.decision_note

        if data.status == StaffTimeOffStatus.APPROVED:
            current_date = db_request.start_date
            while current_date <= db_request.end_date:
                time_off_block = StaffSchedule(
                    staff_id=db_request.staff_id,
                    specific_date=current_date,
                    start_time=datetime.time(0, 0),
                    end_time=datetime.time(23, 59),
                    schedule_type=ScheduleType.TIME_OFF,
                    note=f"Nghỉ phép: {db_request.reason or ''}",
                )
                db.add(time_off_block)
                current_date += datetime.timedelta(days=1)

        db.add(db_request)
        db.commit()
        db.refresh(db_request)
        return StaffTimeOffPublic.model_validate(db_request)

    # --- Offboarding Logic ---
    def _load_future_appointments(
        self, db: Session, staff_id: uuid.UUID
    ) -> List[FutureAppointmentInfo]:
        return []

    def offboard_staff(
        self, db: Session, staff_id: uuid.UUID, admin_user: User
    ) -> StaffOffboardingResult:
        if not admin_user.is_admin:
            raise HTTPException(
                status_code=403,
                detail="Chỉ quản trị viên mới được phép offboard nhân viên",
            )

        staff_profile = self.get_by_id(db, id=staff_id)
        db.refresh(staff_profile, attribute_names=["user"])

        staff_profile.employment_status = EmploymentStatus.RESIGNED
        staff_profile.user.is_active = False
        db.add(staff_profile)

        future_appointments = self._load_future_appointments(db, staff_id)

        db.commit()
        db.refresh(staff_profile)

        return StaffOffboardingResult(
            staff_profile=self._serialize_staff_profile(staff_profile),
            future_appointments=future_appointments,
        )


staff_service = StaffService()
