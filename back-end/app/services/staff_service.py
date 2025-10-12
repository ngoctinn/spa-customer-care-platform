# app/services/staff_service.py
"""Business logic cho nghiệp vụ quản lý nhân viên."""

from __future__ import annotations

import datetime as dt
import uuid
from typing import Iterable, List, Optional

from fastapi import HTTPException, status
from sqlalchemy import and_, or_
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select

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
    StaffScheduleBulkCreate,
    StaffScheduleCollection,
    StaffScheduleCreate,
    StaffSchedulePublic,
    StaffScheduleUpdate,
    StaffServiceAssignment,
    StaffTimeOffCreate,
    StaffTimeOffPublic,
    StaffTimeOffUpdateStatus,
)
from app.utils.common import get_object_or_404


# ---------------------------------------------------------------------------
# Hàm tiện ích nội bộ
# ---------------------------------------------------------------------------


def _serialize_staff_profile(staff: StaffProfile) -> StaffProfilePublic:
    user = staff.user
    return StaffProfilePublic(
        id=staff.id,
        user_id=staff.user_id,
        phone_number=staff.phone_number,
        position=staff.position,
        hire_date=staff.hire_date,
        employment_status=staff.employment_status,
        skills_summary=staff.skills_summary,
        notes=staff.notes,
        user_full_name=user.full_name if user else None,
        user_email=user.email if user else None,
        user_is_active=user.is_active if user else False,
    )


def _serialize_staff_with_services(staff: StaffProfile) -> StaffProfileWithServices:
    profile = _serialize_staff_profile(staff)
    services = [service for service in staff.services if not service.is_deleted]
    profile_with_services = StaffProfileWithServices(**profile.model_dump())
    profile_with_services.services = [
        ServicePublic.model_validate(service, from_attributes=True)
        for service in services
    ]
    return profile_with_services


def _serialize_schedule(schedule: StaffSchedule) -> StaffSchedulePublic:
    return StaffSchedulePublic.model_validate(schedule, from_attributes=True)


def _serialize_time_off(time_off: StaffTimeOff) -> StaffTimeOffPublic:
    return StaffTimeOffPublic.model_validate(time_off, from_attributes=True)


def _ensure_user_exists(db: Session, user_id: uuid.UUID) -> User:
    user = db.get(User, user_id)
    if not user or user.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tài khoản người dùng không tồn tại",
        )
    return user


def _get_staff_by_user_id(db: Session, user_id: uuid.UUID) -> Optional[StaffProfile]:
    return db.exec(
        select(StaffProfile)
        .options(selectinload(StaffProfile.user))
        .where(
            StaffProfile.user_id == user_id,
            StaffProfile.is_deleted == False,  # noqa: E712
        )
    ).first()


def _get_staff_profile(db: Session, staff_id: uuid.UUID) -> StaffProfile:
    staff = get_object_or_404(db, model=StaffProfile, obj_id=staff_id)
    db.refresh(staff, attribute_names=["user", "services", "schedules", "time_off_requests"])
    return staff


def _remove_existing_time_off_blocks(
    db: Session, *, staff_id: uuid.UUID, start_date: dt.date, end_date: dt.date
) -> None:
    """Xóa mềm các ca được tạo ra từ đơn nghỉ phép (schedule_type = TIME_OFF)."""

    existing = db.exec(
        select(StaffSchedule)
        .where(
            StaffSchedule.staff_id == staff_id,
            StaffSchedule.schedule_type == ScheduleType.TIME_OFF,
            StaffSchedule.is_deleted == False,  # noqa: E712
            StaffSchedule.specific_date >= start_date,
            StaffSchedule.specific_date <= end_date,
        )
    ).all()
    for item in existing:
        item.is_deleted = True
        db.add(item)


def _create_time_off_blocks(
    db: Session, *, staff_id: uuid.UUID, start_date: dt.date, end_date: dt.date
) -> None:
    """Tạo các ca "không sẵn sàng" tương ứng với thời gian nghỉ phép."""

    _remove_existing_time_off_blocks(
        db, staff_id=staff_id, start_date=start_date, end_date=end_date
    )

    current = start_date
    while current <= end_date:
        schedule = StaffSchedule(
            staff_id=staff_id,
            specific_date=current,
            start_time=dt.time(0, 0),
            end_time=dt.time(23, 59, 59),
            is_active=False,
            is_recurring=False,
            schedule_type=ScheduleType.TIME_OFF,
            note="Tự động tạo từ đơn nghỉ phép đã được duyệt",
        )
        db.add(schedule)
        current += dt.timedelta(days=1)


def _load_future_appointments(
    db: Session, *, staff_id: uuid.UUID, reference_date: Optional[dt.datetime] = None
) -> List[FutureAppointmentInfo]:
    """
    Truy vấn các lịch hẹn tương lai của nhân viên.
    Nếu hệ thống chưa có bảng lịch hẹn, hàm trả về danh sách rỗng.
    """

    try:
        from app.models.appointments_model import Appointment  # type: ignore
    except ImportError:
        return []

    ref = reference_date or dt.datetime.utcnow()
    appointments = db.exec(
        select(Appointment).where(
            Appointment.staff_id == staff_id,
            Appointment.start_time >= ref,
            getattr(Appointment, "is_deleted", False) == False,  # noqa: E712
        )
    ).all()

    result: List[FutureAppointmentInfo] = []
    for appt in appointments:
        result.append(
            FutureAppointmentInfo(
                appointment_id=appt.id,
                scheduled_start=appt.start_time,
                scheduled_end=getattr(appt, "end_time", appt.start_time),
                service_id=getattr(appt, "service_id", None),
                customer_id=getattr(appt, "customer_id", None),
                note=getattr(appt, "notes", None),
            )
        )
    return result


# ---------------------------------------------------------------------------
# Hồ sơ nhân viên
# ---------------------------------------------------------------------------


def create_staff_profile(db: Session, *, data: StaffProfileCreate) -> StaffProfilePublic:
    user = _ensure_user_exists(db, data.user_id)
    if user.staff_profile and not user.staff_profile.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Người dùng này đã có hồ sơ nhân viên",
        )

    profile = StaffProfile(**data.model_dump())
    db.add(profile)
    db.commit()
    db.refresh(profile)
    db.refresh(user)
    return _serialize_staff_profile(profile)


def list_staff_profiles(
    db: Session, *, skip: int = 0, limit: int = 100
) -> List[StaffProfilePublic]:
    staff_list = db.exec(
        select(StaffProfile)
        .options(selectinload(StaffProfile.user))
        .where(StaffProfile.is_deleted == False)  # noqa: E712
        .offset(skip)
        .limit(limit)
    ).all()
    return [_serialize_staff_profile(staff) for staff in staff_list]


def get_staff_profile_by_user(
    db: Session, *, user_id: uuid.UUID
) -> StaffProfilePublic | None:
    staff = _get_staff_by_user_id(db, user_id)
    return _serialize_staff_profile(staff) if staff else None


def get_staff_profile_detail(db: Session, *, staff_id: uuid.UUID) -> StaffProfileWithServices:
    staff = db.exec(
        select(StaffProfile)
        .options(
            selectinload(StaffProfile.user),
            selectinload(StaffProfile.services),
        )
        .where(
            StaffProfile.id == staff_id,
            StaffProfile.is_deleted == False,  # noqa: E712
        )
    ).first()
    if not staff:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Không tìm thấy nhân viên")
    return _serialize_staff_with_services(staff)


def update_staff_profile(
    db: Session, *, staff_id: uuid.UUID, data: StaffProfileUpdate
) -> StaffProfilePublic:
    staff = _get_staff_profile(db, staff_id)
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(staff, field, value)
    db.add(staff)
    db.commit()
    db.refresh(staff)
    return _serialize_staff_profile(staff)


def assign_services_to_staff(
    db: Session, *, staff_id: uuid.UUID, assignment: StaffServiceAssignment
) -> StaffProfileWithServices:
    staff = _get_staff_profile(db, staff_id)
    if not assignment.service_ids:
        staff.services = []
    else:
        services = db.exec(
            select(Service).where(
                Service.id.in_(assignment.service_ids),
                Service.is_deleted == False,  # noqa: E712
            )
        ).all()
        if len(services) != len(set(assignment.service_ids)):
            raise HTTPException(
                status.HTTP_404_NOT_FOUND,
                detail="Một hoặc nhiều dịch vụ không tồn tại",
            )
        staff.services = services
    db.add(staff)
    db.commit()
    db.refresh(staff)
    return _serialize_staff_with_services(staff)


# ---------------------------------------------------------------------------
# Lịch làm việc
# ---------------------------------------------------------------------------


def set_weekly_schedules(
    db: Session, *, staff_id: uuid.UUID, payload: StaffScheduleBulkCreate
) -> List[StaffSchedulePublic]:
    staff = _get_staff_profile(db, staff_id)
    incoming: Iterable[StaffScheduleCreate] = payload.schedules
    # Xóa mềm toàn bộ ca lặp lại hiện tại để tạo mới
    existing = db.exec(
        select(StaffSchedule).where(
            StaffSchedule.staff_id == staff.id,
            StaffSchedule.is_recurring == True,
            StaffSchedule.is_deleted == False,  # noqa: E712
        )
    ).all()
    for schedule in existing:
        schedule.is_deleted = True
        db.add(schedule)

    new_items: List[StaffSchedule] = []
    for item in incoming:
        if item.day_of_week is None:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                detail="Ca lặp lại hàng tuần phải có day_of_week",
            )
        schedule_data = item.model_dump()
        schedule_data.update({"is_recurring": True, "schedule_type": ScheduleType.WORKING})
        schedule = StaffSchedule(staff_id=staff.id, **schedule_data)
        db.add(schedule)
        new_items.append(schedule)

    db.commit()
    for schedule in new_items:
        db.refresh(schedule)
    return [_serialize_schedule(s) for s in new_items]


def update_staff_schedule(
    db: Session, *, schedule_id: uuid.UUID, data: StaffScheduleUpdate
) -> StaffSchedulePublic:
    schedule = get_object_or_404(db, model=StaffSchedule, obj_id=schedule_id)
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(schedule, field, value)
    db.add(schedule)
    db.commit()
    db.refresh(schedule)
    return _serialize_schedule(schedule)


def _query_staff_schedules(
    db: Session,
    *,
    staff_id: uuid.UUID,
    week_start: Optional[dt.date] = None,
) -> List[StaffSchedule]:
    query = (
        select(StaffSchedule)
        .where(
            StaffSchedule.staff_id == staff_id,
            StaffSchedule.is_deleted == False,  # noqa: E712
        )
        .order_by(StaffSchedule.is_recurring.desc(), StaffSchedule.day_of_week, StaffSchedule.specific_date)
    )
    if week_start:
        week_end = week_start + dt.timedelta(days=6)
        query = query.where(
            or_(
                StaffSchedule.is_recurring == True,
                and_(
                    StaffSchedule.specific_date >= week_start,
                    StaffSchedule.specific_date <= week_end,
                ),
            )
        )
    return db.exec(query).all()


def _query_staff_time_off(
    db: Session,
    *,
    staff_id: uuid.UUID,
    week_start: Optional[dt.date] = None,
) -> List[StaffTimeOff]:
    query = select(StaffTimeOff).where(
        StaffTimeOff.staff_id == staff_id,
        StaffTimeOff.is_deleted == False,  # noqa: E712
    )
    if week_start:
        week_end = week_start + dt.timedelta(days=6)
        query = query.where(
            and_(
                StaffTimeOff.start_date <= week_end,
                StaffTimeOff.end_date >= week_start,
            )
        )
    return db.exec(query.order_by(StaffTimeOff.start_date)).all()


def get_staff_schedule(
    db: Session, *, staff_id: uuid.UUID, week_start: Optional[dt.date] = None
) -> StaffScheduleCollection:
    staff = _get_staff_profile(db, staff_id)
    schedules = _query_staff_schedules(db, staff_id=staff_id, week_start=week_start)
    time_off = _query_staff_time_off(db, staff_id=staff_id, week_start=week_start)
    return StaffScheduleCollection(
        staff=_serialize_staff_profile(staff),
        schedules=[_serialize_schedule(item) for item in schedules],
        time_off=[_serialize_time_off(item) for item in time_off],
    )


def get_weekly_schedule_overview(
    db: Session, *, week_start: dt.date, staff_id: uuid.UUID | None = None
) -> List[StaffScheduleCollection]:
    query = (
        select(StaffProfile)
        .options(selectinload(StaffProfile.user))
        .where(StaffProfile.is_deleted == False)  # noqa: E712
    )
    if staff_id:
        query = query.where(StaffProfile.id == staff_id)
    staff_list = db.exec(query).all()

    overview: List[StaffScheduleCollection] = []
    for staff in staff_list:
        overview.append(
            get_staff_schedule(db, staff_id=staff.id, week_start=week_start)
        )
    return overview


# ---------------------------------------------------------------------------
# Nghỉ phép
# ---------------------------------------------------------------------------


def create_time_off_request(
    db: Session,
    *,
    requester: StaffProfile | None,
    payload: StaffTimeOffCreate,
) -> StaffTimeOffPublic:
    staff_id = payload.staff_id or (requester.id if requester else None)
    if not staff_id:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Cần cung cấp staff_id hoặc đăng nhập bằng tài khoản nhân viên",
        )
    staff = _get_staff_profile(db, staff_id)
    data = payload.model_dump(exclude={"staff_id"})
    request = StaffTimeOff(staff_id=staff.id, **data)
    db.add(request)
    db.commit()
    db.refresh(request)
    return _serialize_time_off(request)


def update_time_off_status(
    db: Session,
    *,
    request_id: uuid.UUID,
    data: StaffTimeOffUpdateStatus,
    approver: User,
) -> StaffTimeOffPublic:
    request = get_object_or_404(db, model=StaffTimeOff, obj_id=request_id)
    request.status = data.status
    request.decision_note = data.decision_note
    request.approver_id = approver.id
    request.approved_at = dt.datetime.utcnow()
    db.add(request)

    if data.status == StaffTimeOffStatus.APPROVED:
        _create_time_off_blocks(
            db,
            staff_id=request.staff_id,
            start_date=request.start_date,
            end_date=request.end_date,
        )
    elif data.status == StaffTimeOffStatus.REJECTED:
        _remove_existing_time_off_blocks(
            db,
            staff_id=request.staff_id,
            start_date=request.start_date,
            end_date=request.end_date,
        )

    db.commit()
    db.refresh(request)
    return _serialize_time_off(request)


# ---------------------------------------------------------------------------
# Offboarding
# ---------------------------------------------------------------------------


def offboard_staff(
    db: Session, *, staff_id: uuid.UUID, admin_user: User
) -> StaffOffboardingResult:
    if not admin_user.is_admin:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "Chỉ quản trị viên mới được phép offboard nhân viên",
        )

    staff = _get_staff_profile(db, staff_id)
    staff.employment_status = EmploymentStatus.RESIGNED
    if staff.user:
        staff.user.is_active = False
        db.add(staff.user)

    db.add(staff)
    db.commit()
    db.refresh(staff)
    if staff.user:
        db.refresh(staff.user)

    future_appointments = _load_future_appointments(db, staff_id=staff_id)

    return StaffOffboardingResult(
        staff=_serialize_staff_profile(staff),
        future_appointments=future_appointments,
    )
