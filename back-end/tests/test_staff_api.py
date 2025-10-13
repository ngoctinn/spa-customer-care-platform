# tests/test_staff_api.py
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, select  # << THÊM IMPORT
import uuid
import datetime

from app.models.users_model import User

# << THÊM CÁC IMPORT NÀY >>
from app.models.staff_model import (
    StaffProfile,
    StaffTimeOff,
    StaffTimeOffStatus,
    StaffSchedule,
    ScheduleType,
    EmploymentStatus,
)
from app.models.services_model import Service

# =================================================================
# Tests cho Staff Profile CRUD (Admin)
# =================================================================


def test_admin_create_staff_profile_success(
    admin_authenticated_client: TestClient, test_user: User
):
    """Kiểm tra admin tạo hồ sơ nhân viên thành công."""
    staff_data = {
        "user_id": str(test_user.id),
        "phone_number": "0912345678",
        "position": "Chuyên viên tư vấn",
        "hire_date": "2024-01-10",
    }
    response = admin_authenticated_client.post("/staff/", json=staff_data)
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["user_id"] == str(test_user.id)
    assert data["phone_number"] == staff_data["phone_number"]
    assert data["user_full_name"] == test_user.full_name


def test_admin_create_staff_for_non_existent_user_fails(
    admin_authenticated_client: TestClient,
):
    """Kiểm tra lỗi khi tạo hồ sơ cho user_id không tồn tại."""
    staff_data = {
        "user_id": str(uuid.uuid4()),
        "phone_number": "0912345699",
    }
    response = admin_authenticated_client.post("/staff/", json=staff_data)
    assert response.status_code == 404
    assert "Tài khoản người dùng không tồn tại" in response.json()["detail"]


def test_normal_user_cannot_create_staff_profile(
    authenticated_client: TestClient, test_user: User
):
    """Kiểm tra user thường không thể tạo hồ sơ nhân viên."""
    staff_data = {"user_id": str(test_user.id), "phone_number": "0912345678"}
    response = authenticated_client.post("/staff/", json=staff_data)
    assert response.status_code == 403


def test_admin_get_staff_list(
    admin_authenticated_client: TestClient, staff_profile: StaffProfile
):
    """Kiểm tra admin có thể lấy danh sách nhân viên."""
    response = admin_authenticated_client.get("/staff/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert any(item["id"] == str(staff_profile.id) for item in data)


def test_admin_get_staff_detail(
    admin_authenticated_client: TestClient, staff_profile: StaffProfile
):
    """Kiểm tra admin có thể lấy chi tiết một nhân viên."""
    response = admin_authenticated_client.get(f"/staff/{staff_profile.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(staff_profile.id)
    assert data["user_email"] == staff_profile.user.email
    assert "services" in data


def test_admin_update_staff_profile(
    admin_authenticated_client: TestClient, staff_profile: StaffProfile
):
    """Kiểm tra admin cập nhật hồ sơ nhân viên thành công."""
    update_data = {"position": "Trưởng phòng kỹ thuật", "notes": "Ghi chú mới"}
    response = admin_authenticated_client.put(
        f"/staff/{staff_profile.id}", json=update_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["position"] == update_data["position"]
    assert data["notes"] == update_data["notes"]


# =================================================================
# Tests cho Gán Dịch vụ (Service Assignment)
# =================================================================


def test_admin_assign_services_to_staff(
    admin_authenticated_client: TestClient,
    staff_profile: StaffProfile,
    basic_service_fixture: Service,
):
    """Kiểm tra admin gán dịch vụ cho nhân viên thành công."""
    service_id = str(basic_service_fixture.id)
    assignment_data = {"service_ids": [service_id]}

    response = admin_authenticated_client.put(
        f"/staff/{staff_profile.id}/services", json=assignment_data
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data["services"]) == 1
    assert data["services"][0]["id"] == service_id


# =================================================================
# Tests cho Lịch làm việc (Schedule)
# =================================================================


def test_admin_set_weekly_schedule(
    admin_authenticated_client: TestClient, staff_profile: StaffProfile
):
    """Kiểm tra admin thiết lập lịch làm việc tuần thành công."""
    schedule_data = {
        "schedules": [
            {"day_of_week": 1, "start_time": "09:00:00", "end_time": "18:00:00"},
            {"day_of_week": 2, "start_time": "09:00:00", "end_time": "18:00:00"},
            {"day_of_week": 3, "start_time": "09:00:00", "end_time": "18:00:00"},
            {"day_of_week": 4, "start_time": "09:00:00", "end_time": "18:00:00"},
            {"day_of_week": 5, "start_time": "09:00:00", "end_time": "18:00:00"},
            {
                "day_of_week": 6,
                "is_active": False,
                "start_time": "09:00:00",
                "end_time": "18:00:00",
            },
            {
                "day_of_week": 7,
                "is_active": False,
                "start_time": "09:00:00",
                "end_time": "18:00:00",
            },
        ]
    }
    response = admin_authenticated_client.put(
        f"/staff/{staff_profile.id}/schedules", json=schedule_data
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert len(data) == 7
    assert data[0]["day_of_week"] == 1
    assert data[0]["is_active"] is True


# =================================================================
# Tests cho Nghỉ phép (Time Off)
# =================================================================


def test_staff_request_time_off_success(
    staff_authenticated_client: TestClient, staff_profile: StaffProfile
):
    """Kiểm tra nhân viên gửi yêu cầu nghỉ phép thành công."""
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
    assert data["reason"] == time_off_data["reason"]


def test_admin_approve_time_off_request(
    admin_authenticated_client: TestClient,
    db_session: Session,
    staff_profile: StaffProfile,
):
    """Kiểm tra admin duyệt yêu cầu nghỉ phép thành công."""
    # 1. Tạo một yêu cầu nghỉ phép trước
    time_off_request = StaffTimeOff(
        staff_id=staff_profile.id,
        start_date=datetime.date.today(),
        end_date=datetime.date.today(),
        status=StaffTimeOffStatus.PENDING,
    )
    db_session.add(time_off_request)
    db_session.commit()
    db_session.refresh(time_off_request)

    # 2. Admin duyệt yêu cầu
    approval_data = {"status": StaffTimeOffStatus.APPROVED, "decision_note": "Đã duyệt"}
    response = admin_authenticated_client.put(
        f"/staff/time-off/{time_off_request.id}", json=approval_data
    )

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == StaffTimeOffStatus.APPROVED
    assert data["decision_note"] == "Đã duyệt"

    # 3. Kiểm tra xem ca nghỉ (schedule block) đã được tạo chưa
    schedules = db_session.exec(
        select(StaffSchedule).where(
            StaffSchedule.staff_id == staff_profile.id,
            StaffSchedule.schedule_type == ScheduleType.TIME_OFF,
        )
    ).all()
    assert len(schedules) >= 1
    assert schedules[0].specific_date == time_off_request.start_date


# =================================================================
# Tests cho Offboarding
# =================================================================


def test_admin_offboard_staff_success(
    admin_authenticated_client: TestClient,
    db_session: Session,
    staff_profile: StaffProfile,
):
    """Kiểm tra admin cho nhân viên nghỉ việc thành công."""
    response = admin_authenticated_client.post(f"/staff/{staff_profile.id}/offboard")

    assert response.status_code == 200
    data = response.json()
    assert data["staff_profile"]["employment_status"] == EmploymentStatus.RESIGNED
    assert data["staff_profile"]["user_is_active"] is False

    # Kiểm tra lại trực tiếp trong DB
    db_session.expire_all()
    updated_user = db_session.get(User, staff_profile.user_id)
    assert updated_user.is_active is False
