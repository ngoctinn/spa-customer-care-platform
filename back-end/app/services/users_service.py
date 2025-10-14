# app/services/users_service.py
from typing import Any, Dict, List, Optional
import uuid

from sqlmodel import Session, select

from app.core.security import get_password_hash
from app.core.constants import DefaultRoles, PasswordPolicy
from app.core.messages import UserMessages, RoleMessages
from app.core.exceptions import UserExceptions, RoleExceptions, BusinessLogicError

from app.models.users_model import User
from app.models.staff_model import StaffProfile
from app.schemas.users_schema import (
    AdminCreateStaffRequest,
    UserCreate,
    UserUpdateByAdmin,
    UserUpdateMe,
)
from app.services import roles_service
from app.schemas.roles_schema import RoleCreate

# =================================================================
# CÁC HÀM TRUY VẤN (QUERIES)
# =================================================================


def get_user_by_email(db_session: Session, *, email: str) -> Optional[User]:
    """
    Tìm một người dùng trong database bằng email.
    """
    return db_session.exec(select(User).where(User.email == email)).first()


def get_user_by_id(db_session: Session, *, user_id: uuid.UUID) -> User:
    """
    Tìm người dùng bằng ID.
    Nếu không tìm thấy hoặc đã bị xóa mềm, raise exception.
    """
    user = db_session.get(User, user_id)
    if not user or user.is_deleted:
        raise UserExceptions.user_not_found()
    return user


# =================================================================
# CÁC HÀM NGHIỆP VỤ (BUSINESS LOGIC)
# =================================================================


def create_online_user(db_session: Session, *, user_in: UserCreate) -> User:
    """
    Xử lý luồng đăng ký online. CHỈ TẠO USER, KHÔNG TẠO CUSTOMER.
    """
    if get_user_by_email(db_session, email=user_in.email):
        raise UserExceptions.email_already_exists()

    hashed_password = get_password_hash(user_in.password)
    # LOẠI BỎ full_name khỏi việc tạo User
    user_data = user_in.model_dump(exclude={"password", "full_name"})

    db_user = User(**user_data, hashed_password=hashed_password)

    db_session.add(db_user)
    db_session.commit()
    db_session.refresh(db_user)

    # Sẽ tạo Customer profile ở một bước riêng (PUT /customers/me/profile)

    return db_user


def update_user(db_session: Session, *, db_user: User, user_in: UserUpdateMe) -> User:
    """
    Cập nhật thông tin người dùng.
    """
    user_data = user_in.model_dump(
        exclude_unset=True
    )  # Chỉ lấy các trường được gửi lên
    for key, value in user_data.items():
        setattr(db_user, key, value)

    db_session.add(db_user)
    db_session.commit()
    db_session.refresh(db_user)
    return db_user


def assign_role_to_user(
    db_session: Session, *, user_id: uuid.UUID, role_id: uuid.UUID
) -> User:
    """Gán một vai trò cho một người dùng."""
    user = get_user_by_id(db_session, user_id=user_id)
    role = roles_service.get_role_by_id(db_session, role_id=role_id)

    if role in user.roles:
        raise RoleExceptions.user_already_has_role()

    user.roles.append(role)
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def remove_role_from_user(
    db_session: Session, *, user_id: uuid.UUID, role_id: uuid.UUID
) -> User:
    """Xóa một vai trò khỏi người dùng."""
    user = get_user_by_id(db_session, user_id=user_id)
    role = roles_service.get_role_by_id(db_session, role_id=role_id)

    if role not in user.roles:
        raise RoleExceptions.user_does_not_have_role()

    user.roles.remove(role)
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


# =================================================================
# CÁC HÀM DÀNH CHO ADMIN
# =================================================================
def get_all_users(db_session: Session, skip: int = 0, limit: int = 100) -> List[User]:
    """
    Lấy danh sách tất cả người dùng (chưa bị xóa mềm).
    """
    users = db_session.exec(
        select(User).where(User.is_deleted == False).offset(skip).limit(limit)
    ).all()
    return users


# THAY ĐỔI: Đổi tên và logic hàm
def create_staff_account(
    db_session: Session, *, user_in: AdminCreateStaffRequest
) -> User:
    """
    [Admin] Tạo tài khoản nhân viên mới, bao gồm User và StaffProfile trong một giao tác.
    """
    if get_user_by_email(db_session, email=user_in.email):
        raise UserExceptions.email_already_exists()

    role = None
    if user_in.role_id:
        role = roles_service.get_role_by_id(db_session, role_id=user_in.role_id)
    else:
        role = roles_service.get_role_by_name(
            db_session, name=DefaultRoles.STAFF
        )  # Mặc định là role 'staff'

    try:
        # 1. Tạo User
        temp_password = f"{PasswordPolicy.TEMP_PASSWORD_PREFIX}{uuid.uuid4()}"
        hashed_password = get_password_hash(temp_password)
        user_data = user_in.model_dump(exclude={"role_id", "full_name", "phone_number"})
        db_user = User(
            **user_data, hashed_password=hashed_password, is_email_verified=True
        )

        # 2. Gán Role
        if not role:
            role_to_create = RoleCreate(
                name=DefaultRoles.STAFF, description="Vai trò cho nhân viên"
            )
            role = roles_service.create_role(db_session, role_in=role_to_create)

        db_user.roles.append(role)
        db_session.add(db_user)

        # 3. Tạo StaffProfile và liên kết
        # Flush để db_user có ID
        db_session.flush()

        staff_profile = StaffProfile(
            user_id=db_user.id,
            full_name=user_in.full_name,
            phone_number=user_in.phone_number,
        )
        db_session.add(staff_profile)

        # 4. Commit một lần duy nhất
        db_session.commit()

    except Exception as e:
        db_session.rollback()
        raise BusinessLogicError(
            message=UserMessages.STAFF_ACCOUNT_CREATE_ERROR.format(error=str(e))
        )

    db_session.refresh(db_user)
    return db_user


def update_user_by_admin(
    db_session: Session, *, db_user: User, user_in: UserUpdateByAdmin
) -> User:
    """
    Cập nhật thông tin người dùng bởi admin.
    """
    user_data = user_in.model_dump(exclude_unset=True)
    for key, value in user_data.items():
        setattr(db_user, key, value)

    db_session.add(db_user)
    db_session.commit()
    db_session.refresh(db_user)
    return db_user


def delete_user_by_id(db_session: Session, *, user_to_delete: User) -> User:
    """Xóa mềm một người dùng."""
    user_to_delete.is_deleted = True
    user_to_delete.is_active = False
    db_session.add(user_to_delete)
    db_session.commit()
    db_session.refresh(user_to_delete)
    return user_to_delete
