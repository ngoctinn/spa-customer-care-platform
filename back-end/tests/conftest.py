import os
from typing import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine

# Đặt các biến môi trường cần thiết trước khi import ứng dụng
os.environ.setdefault("DATABASE_URL", "sqlite:///test.db")
os.environ.setdefault("SECRET_KEY", "test")
os.environ.setdefault("ALGORITHM", "HS256")
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
os.environ.setdefault("MAIL_USERNAME", "test@example.com")
os.environ.setdefault("MAIL_PASSWORD", "secret")
os.environ.setdefault("MAIL_FROM", "test@example.com")
os.environ.setdefault("MAIL_PORT", "587")
os.environ.setdefault("MAIL_SERVER", "smtp.example.com")
os.environ.setdefault("MAIL_STARTTLS", "False")
os.environ.setdefault("MAIL_SSL_TLS", "False")
os.environ.setdefault("GOOGLE_CLIENT_ID", "client-id")
os.environ.setdefault("GOOGLE_CLIENT_SECRET", "client-secret")
os.environ.setdefault("BACKEND_CORS_ORIGINS", '["*"]')
os.environ.setdefault("SUPABASE_URL", "http://localhost")
os.environ.setdefault("SUPABASE_KEY", "supabase-key")
os.environ.setdefault("SUPABASE_BUCKET_NAME", "bucket")

from app.core.dependencies import get_db_session  # noqa: E402
from app.main import app  # noqa: E402

# Import models để đảm bảo SQLModel biết tất cả bảng
from app.models import association_tables  # noqa: F401
from app.models import catalog_model  # noqa: F401
from app.models import products_model  # noqa: F401
from app.models import schedules_model  # noqa: F401
from app.models import services_model  # noqa: F401
from app.models import treatment_plans_model  # noqa: F401
from app.models import users_model  # noqa: F401


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


@pytest.fixture(name="session")
def session_fixture(engine) -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(engine):
    def _get_test_session():
        with Session(engine) as session:
            yield session

    app.dependency_overrides[get_db_session] = _get_test_session
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()
