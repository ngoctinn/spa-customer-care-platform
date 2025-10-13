# tests/test_staff_api.py
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, select
import uuid
import datetime

from app.models.users_model import User
from app.models.staff_model import (
    StaffProfile,
    StaffTimeOff,
    StaffTimeOffStatus,
    StaffSchedule,
    ScheduleType,
    EmploymentStatus,
)
from app.models.services_model import Service

# Các bài test cho việc tạo staff profile qua /staff/ đã bị xóa, rất tốt!


def test_admin_get_staff_list(
    admin_authenticated_client: TestClient, staff_profile: StaffProfile
):
    response = admin_authenticated_client.get("/staff/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert any(item["id"] == str(staff_profile.id) for item in data)


def test_admin_get_staff_detail(
    admin_authenticated_client: TestClient, staff_profile: StaffProfile
):
    response = admin_authenticated_client.get(f"/staff/{staff_profile.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(staff_profile.id)
    assert data["user_email"] == staff_profile.user.email


def test_admin_update_staff_profile(
    admin_authenticated_client: TestClient, staff_profile: StaffProfile
):
    update_data = {"position": "Trưởng phòng kỹ thuật"}
    response = admin_authenticated_client.put(
        f"/staff/{staff_profile.id}", json=update_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["position"] == update_data["position"]


def test_admin_assign_services_to_staff(
    admin_authenticated_client: TestClient,
    staff_profile: StaffProfile,
    basic_service_fixture: Service,
):
    service_id = str(basic_service_fixture.id)
    assignment_data = {"service_ids": [service_id]}
    response = admin_authenticated_client.put(
        f"/staff/{staff_profile.id}/services", json=assignment_data
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["services"]) == 1
    assert data["services"][0]["id"] == service_id


def test_admin_set_weekly_schedule(
    admin_authenticated_client: TestClient, staff_profile: StaffProfile
):
    """Kiểm tra admin thiết lập lịch làm việc tuần thành công."""
    # SỬA LỖI: Gửi trực tiếp một danh sách làm payload
    schedule_data = [
        {"day_of_week": 1, "start_time": "09:00:00", "end_time": "18:00:00"},
        {"day_of_week": 2, "start_time": "09:00:00", "end_time": "17:00:00"},
    ]
    response = admin_authenticated_client.put(
        f"/staff/{staff_profile.id}/schedules", json=schedule_data
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert len(data) == 2
    assert data[0]["day_of_week"] == 1


def test_staff_request_time_off_success(
    staff_authenticated_client: TestClient, staff_profile: StaffProfile
):
    today = datetime.date.today()
    tomorrow = today + datetime.timedelta(days=1)
    time_off_data = {
        "start_date": today.isoformat(),
        "end_date": tomorrow.isoformat(),
        "reason": "Việc gia đình",
    }
    response = staff_authenticated_client.post("/staff/time-off", json=time_off_data)
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["staff_id"] == str(staff_profile.id)
    assert data["status"] == StaffTimeOffStatus.PENDING


def test_admin_approve_time_off_request(
    admin_authenticated_client: TestClient,
    db_session: Session,
    staff_profile: StaffProfile,
):
    time_off_request = StaffTimeOff(
        staff_id=staff_profile.id,
        start_date=datetime.date.today(),
        end_date=datetime.date.today(),
        status=StaffTimeOffStatus.PENDING,
    )
    db_session.add(time_off_request)
    db_session.commit()
    db_session.refresh(time_off_request)

    approval_data = {"status": StaffTimeOffStatus.APPROVED, "decision_note": "Đã duyệt"}
    response = admin_authenticated_client.put(
        f"/staff/time-off/{time_off_request.id}", json=approval_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == StaffTimeOffStatus.APPROVED

    schedules = db_session.exec(
        select(StaffSchedule).where(
            StaffSchedule.staff_id == staff_profile.id,
            StaffSchedule.schedule_type == ScheduleType.TIME_OFF,
        )
    ).all()
    assert len(schedules) >= 1


def test_admin_offboard_staff_success(
    admin_authenticated_client: TestClient,
    db_session: Session,
    staff_profile: StaffProfile,
):
    response = admin_authenticated_client.post(f"/staff/{staff_profile.id}/offboard")
    assert response.status_code == 200
    data = response.json()
    assert data["staff_profile"]["employment_status"] == EmploymentStatus.RESIGNED
    assert data["staff_profile"]["user_is_active"] is False

    db_session.expire_all()
    updated_user = db_session.get(User, staff_profile.user_id)
    assert updated_user.is_active is False
