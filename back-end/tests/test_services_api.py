import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine

os.environ.setdefault("DATABASE_URL", "sqlite://")
os.environ.setdefault("SECRET_KEY", "secret")
os.environ.setdefault("ALGORITHM", "HS256")
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
os.environ.setdefault("MAIL_USERNAME", "test@example.com")
os.environ.setdefault("MAIL_PASSWORD", "password")
os.environ.setdefault("MAIL_FROM", "test@example.com")
os.environ.setdefault("MAIL_PORT", "1025")
os.environ.setdefault("MAIL_SERVER", "localhost")
os.environ.setdefault("MAIL_STARTTLS", "false")
os.environ.setdefault("MAIL_SSL_TLS", "false")
os.environ.setdefault("GOOGLE_CLIENT_ID", "client")
os.environ.setdefault("GOOGLE_CLIENT_SECRET", "secret")
os.environ.setdefault("BACKEND_CORS_ORIGINS", "[\"*\"]")
os.environ.setdefault("SUPABASE_URL", "http://localhost")
os.environ.setdefault("SUPABASE_KEY", "key")
os.environ.setdefault("SUPABASE_BUCKET_NAME", "bucket")

from app.core import supabase_client
from app.core.dependencies import get_db_session
from app.main import app
from app.models.catalog_model import Category
from app.schemas.catalog_schema import CategoryTypeEnum


@pytest.fixture(name="engine")
def engine_fixture():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    try:
        yield engine
    finally:
        SQLModel.metadata.drop_all(engine)


@pytest.fixture(name="client")
def client_fixture(engine):
    def get_session_override():
        with Session(engine) as session:
            yield session

    app.dependency_overrides[get_db_session] = get_session_override
    original_upload_image = supabase_client.upload_image

    async def fake_upload_image(file, file_name=None):
        return None

    supabase_client.upload_image = fake_upload_image
    try:
        with TestClient(app) as client:
            yield client
    finally:
        supabase_client.upload_image = original_upload_image
        app.dependency_overrides.clear()


def test_get_services_returns_valid_payload(client, engine):
    # Arrange
    with Session(engine) as session:
        category_1 = Category(
            name="Massage",
            description="Thư giãn",
            category_type=CategoryTypeEnum.service.value,
        )
        category_2 = Category(
            name="Facial",
            description="Chăm sóc da",
            category_type=CategoryTypeEnum.service.value,
        )
        session.add(category_1)
        session.add(category_2)
        session.commit()
        session.refresh(category_1)
        session.refresh(category_2)

        category_ids = [str(category_1.id), str(category_2.id)]

    multipart_form = [
        ("name", (None, "Dịch vụ thư giãn")),
        ("description", (None, "Mô tả dịch vụ")),
        ("price", (None, "150000")),
        ("duration_minutes", (None, "60")),
        ("category_ids", (None, category_ids[0])),
        ("category_ids", (None, category_ids[1])),
        ("preparation_notes", (None, "Chuẩn bị")),
        ("aftercare_instructions", (None, "Chăm sóc")),
        ("contraindications", (None, "Chống chỉ định")),
        ("images", ("test.jpg", b"fake", "image/jpeg")),
    ]

    create_response = client.post("/services", files=multipart_form)
    assert create_response.status_code == 201, create_response.text

    # Act
    list_response = client.get("/services")

    # Assert
    assert list_response.status_code == 200, list_response.text
    payload = list_response.json()
    assert isinstance(payload, list)
    assert len(payload) == 1

    service = payload[0]
    assert set(service["category_ids"]) == set(category_ids)
    assert len(service["categories"]) == 2
    assert {item["id"] for item in service["categories"]} == set(category_ids)
    assert "images" in service
    assert isinstance(service["images"], list)
