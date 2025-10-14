# tests/test_schedules_api.py
import uuid
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.models.users_model import User


# =================================================================
# Tests cho Tag "Schedules Management" - Default Schedules
# =================================================================


def test_get_user_default_schedules_success(
    admin_authenticated_client: TestClient, db_session: Session
):
    """Kiểm tra lấy lịch làm việc mặc định của nhân viên thành công."""
    # Tạo user test
    test_user = User(
        email=f"test_schedule_{uuid.uuid4()}@example.com",
        hashed_password="hashed",
        full_name="Test Schedule User",
        is_active=True,
    )
    db_session.add(test_user)
    db_session.commit()
    db_session.refresh(test_user)

    response = admin_authenticated_client.get(
        f"/admin/users/{test_user.id}/default-schedules"
    )

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 7  # 7 ngày trong tuần
    # Kiểm tra cấu trúc của mỗi schedule
    for schedule in data:
        assert "day_of_week" in schedule
        assert "is_active" in schedule
        assert "start_time" in schedule
        assert "end_time" in schedule


def test_update_user_default_schedules_success(
    admin_authenticated_client: TestClient, db_session: Session
):
    """Kiểm tra cập nhật lịch làm việc mặc định của nhân viên thành công."""
    # Tạo user test
    test_user = User(
        email=f"test_schedule_update_{uuid.uuid4()}@example.com",
        hashed_password="hashed",
        full_name="Test Schedule Update User",
        is_active=True,
    )
    db_session.add(test_user)
    db_session.commit()
    db_session.refresh(test_user)

    # Dữ liệu cập nhật
    update_data = {
        "schedules": [
            {
                "day_of_week": 1,  # Monday
                "is_active": True,
                "start_time": "08:00",
                "end_time": "17:00",
            },
            {
                "day_of_week": 2,  # Tuesday
                "is_active": True,
                "start_time": "08:00",
                "end_time": "17:00",
            },
            {
                "day_of_week": 3,  # Wednesday
                "is_active": False,
                "start_time": None,
                "end_time": None,
            },
            {
                "day_of_week": 4,  # Thursday
                "is_active": True,
                "start_time": "09:00",
                "end_time": "18:00",
            },
            {
                "day_of_week": 5,  # Friday
                "is_active": True,
                "start_time": "08:00",
                "end_time": "17:00",
            },
            {
                "day_of_week": 6,  # Saturday
                "is_active": False,
                "start_time": None,
                "end_time": None,
            },
            {
                "day_of_week": 7,  # Sunday
                "is_active": False,
                "start_time": None,
                "end_time": None,
            },
        ]
    }

    response = admin_authenticated_client.put(
        f"/admin/users/{test_user.id}/default-schedules", json=update_data
    )

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 7

    # Kiểm tra dữ liệu đã được cập nhật
    monday_schedule = next(s for s in data if s["day_of_week"] == 1)
    assert monday_schedule["is_active"] is True
    assert monday_schedule["start_time"] == "08:00:00"
    assert monday_schedule["end_time"] == "17:00:00"

    wednesday_schedule = next(s for s in data if s["day_of_week"] == 3)
    assert wednesday_schedule["is_active"] is False
    assert wednesday_schedule["start_time"] is None
    assert wednesday_schedule["end_time"] is None
