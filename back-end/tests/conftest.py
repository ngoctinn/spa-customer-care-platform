# back-end/tests/conftest.py
import os
import uuid
from typing import Generator
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine


# --- Phần thiết lập môi trường (giữ nguyên) ---
os.environ["ENV_FILE"] = ".env.test"

from app.main import app
from app.core.config import settings
from app.core.dependencies import get_db_session
from app.core.security import get_password_hash
from app.models.users_model import User, Role
from app.models.customers_model import Customer
from app.models.catalog_model import Category
from app.models.services_model import Service
from app.schemas.roles_schema import RoleCreate
from app.schemas.catalog_schema import CategoryTypeEnum
from app.services import roles_service

# --- Phần cấu hình database test (giữ nguyên) ---
engine = create_engine(settings.DATABASE_URL)


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)
    yield
    SQLModel.metadata.drop_all(engine)


@pytest.fixture(scope="function")
def db_session() -> Generator[Session, None, None]:
    connection = engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()


# --- Fixture client GỐC (chưa đăng nhập) ---
@pytest.fixture(scope="function")
def client(db_session: Session) -> Generator[TestClient, None, None]:
    def override_get_db_session() -> Generator[Session, None, None]:
        yield db_session

    app.dependency_overrides[get_db_session] = override_get_db_session
    with TestClient(app) as c:
        yield c
    del app.dependency_overrides[get_db_session]


# =================================================================
# MỞ RỘNG: CÁC FIXTURES MỚI CHO AUTHENTICATION VÀ USER
# =================================================================


@pytest.fixture(scope="function")
def test_user(db_session: Session) -> User:
    """Fixture tạo một user thường và lưu vào DB test."""
    user_data = User(
        email="testuser@example.com",
        full_name="Test User",
        hashed_password=get_password_hash("password123"),
        is_active=True,
        is_email_verified=True,  # Giả sử email đã được xác thực để test login
    )
    db_session.add(user_data)
    db_session.commit()
    db_session.refresh(user_data)
    return user_data


@pytest.fixture(scope="function")
def admin_user(db_session: Session) -> User:
    """Fixture tạo một user admin và lưu vào DB test."""
    # Tạo role 'admin' nếu chưa có
    admin_role = roles_service.get_role_by_name(db_session, name="admin")
    if not admin_role:
        admin_role_in = RoleCreate(name="admin", description="Admin role")
        admin_role = roles_service.create_role(db_session, role_in=admin_role_in)

    user_data = User(
        email="admin@example.com",
        full_name="Admin User",
        hashed_password=get_password_hash("adminpassword"),
        is_active=True,
        is_email_verified=True,
        roles=[admin_role],  # Gán vai trò admin
    )
    db_session.add(user_data)
    db_session.commit()
    db_session.refresh(user_data)
    return user_data


@pytest.fixture(scope="function")
def authenticated_client(client: TestClient, test_user: User) -> TestClient:
    """
    Fixture tạo ra một client đã đăng nhập với tư cách `test_user`.
    """
    login_data = {"username": test_user.email, "password": "password123"}
    client.post("/auth/token", data=login_data)  # API login sẽ set cookie
    return client


@pytest.fixture(scope="function")
def admin_authenticated_client(client: TestClient, admin_user: User) -> TestClient:
    """
    Fixture tạo ra một client đã đăng nhập với tư cách `admin_user`.
    """
    login_data = {"username": admin_user.email, "password": "adminpassword"}
    client.post("/auth/token", data=login_data)
    return client


from app.models.customers_model import Customer


@pytest.fixture(scope="function")
def offline_customer(db_session: Session) -> Customer:
    """
    Fixture tạo một khách hàng vãng lai (offline), không có tài khoản User.
    """
    customer = Customer(
        full_name="Khách vãng lai",
        phone_number="0987654321",
        email="offline.customer@example.com",
    )
    db_session.add(customer)
    db_session.commit()
    db_session.refresh(customer)
    return customer


@pytest.fixture(scope="function")
def customer_profile_for_test_user(db_session: Session, test_user: User) -> Customer:
    """
    Fixture tạo một hồ sơ khách hàng và liên kết nó với `test_user`.
    """
    customer_profile = Customer(
        full_name=test_user.full_name,
        phone_number="0912345678",
        email=test_user.email,
        user_id=test_user.id,  # Liên kết với user
    )
    db_session.add(customer_profile)
    db_session.commit()
    db_session.refresh(customer_profile)
    return customer_profile


# =================================================================
# FIXTURES DÙNG CHUNG CHO SERVICE VÀ CATALOG (ĐÃ DI CHUYỂN VÀO ĐÂY)
# =================================================================


@pytest.fixture(scope="function")
def service_category_fixture(db_session: Session) -> Category:
    """Fixture tạo Category loại 'service'."""
    category_data = Category(
        name=f"Dịch vụ Test {uuid.uuid4()}",
        description="Category cho test service",
        category_type=CategoryTypeEnum.service.value,
    )
    db_session.add(category_data)
    db_session.commit()
    db_session.refresh(category_data)
    return category_data


@pytest.fixture(scope="function")
def basic_service_fixture(
    db_session: Session, service_category_fixture: Category
) -> Service:
    """Fixture tạo một Service cơ bản đã liên kết Category."""
    db_service = Service(
        name=f"Dịch vụ Test {uuid.uuid4()}",
        description="Mô tả test",
        price=100000.0,
        duration_minutes=60,
    )
    db_service.categories.append(service_category_fixture)
    db_session.add(db_service)
    db_session.commit()
    db_session.refresh(db_service)
    return db_service


from app.models.staff_model import StaffProfile
from app.schemas.staff_schema import StaffProfileCreate


@pytest.fixture(scope="function")
def staff_user(db_session: Session) -> User:
    """Fixture tạo một user để gán làm nhân viên."""
    user_data = User(
        email="staffuser@example.com",
        full_name="Staff User",
        hashed_password=get_password_hash("password123"),
        is_active=True,
        is_email_verified=True,
    )
    db_session.add(user_data)
    db_session.commit()
    db_session.refresh(user_data)
    return user_data


@pytest.fixture(scope="function")
def staff_profile(db_session: Session, staff_user: User) -> StaffProfile:
    """Fixture tạo một hồ sơ nhân viên hoàn chỉnh."""
    profile_data = StaffProfileCreate(
        user_id=staff_user.id,
        phone_number="0987654321",
        position="Chuyên viên trị liệu",
    )
    db_profile = StaffProfile.model_validate(profile_data)
    db_session.add(db_profile)
    db_session.commit()
    db_session.refresh(db_profile)
    return db_profile


@pytest.fixture(scope="function")
def staff_authenticated_client(client: TestClient, staff_user: User) -> TestClient:
    """
    Fixture tạo ra một client đã đăng nhập với tư cách `staff_user`.
    """
    login_data = {"username": staff_user.email, "password": "password123"}
    client.post("/auth/token", data=login_data)
    return client
