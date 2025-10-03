# app/services/users_service.py
from typing import Any, Dict, List, Optional
import uuid

from fastapi import HTTPException, status
from sqlmodel import Session, select

from app.core.security import get_password_hash
from app.models.users_model import User
from app.schemas.users_schema import (
    AdminCreateUserRequest,
    UserCreate,
    UserUpdateByAdmin,
    UserUpdateMe,
)
from app.services import roles_service
from app.schemas.roles_schema import RoleCreate
from app.utils.common import get_object_or_404

# =================================================================
# CÁC HÀM TRUY VẤN (QUERIES)
# =================================================================


def get_user_by_email(db_session: Session, *, email: str) -> Optional[User]:
    """
    Tìm một người dùng trong database bằng email.
    """
    return db_session.exec(select(User).where(User.email == email)).first()


def get_user_by_id(db_session: Session, *, user_id: uuid.UUID) -> Optional[User]:
    """Tìm người dùng bằng ID."""
    # Bạn có thể giữ nguyên câu lệnh select hoặc chuyển sang dùng hàm tiện ích
    # để đảm bảo tính nhất quán
    return get_object_or_404(db_session, model=User, obj_id=user_id)


# =================================================================
# CÁC HÀM NGHIỆP VỤ (BUSINESS LOGIC)
# =================================================================


def create_new_user(db_session: Session, *, user_in: UserCreate) -> User:
    """
    Tạo một người dùng mới và lưu vào database.
    """
    # Kiểm tra xem user hoặc email đã tồn tại chưa
    existing_user = db_session.exec(
        select(User).where((User.email == user_in.email))
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email đã tồn tại.",
        )

    # --- TÍCH HỢP GÁN VAI TRÒ MẶC ĐỊNH ---
    # 1. Tìm vai trò "khách hàng"
    customer_role = roles_service.get_role_by_name(db_session, name="khách hàng")
    if not customer_role:
        # --- SỬA LỖI Ở ĐÂY ---
        # 1. Tạo một đối tượng RoleCreate từ dictionary
        role_to_create = RoleCreate(
            name="khách hàng",
            description="Vai trò mặc định cho người dùng mới",
        )
        # 2. Truyền đối tượng đã tạo vào hàm
        customer_role = roles_service.create_role(db_session, role_in=role_to_create)
    # -----------------------------------------

    # Băm mật khẩu
    hashed_password = get_password_hash(user_in.password)

    # Tạo đối tượng User model từ schema
    user_data = user_in.model_dump(exclude={"password"})
    db_user = User(**user_data, hashed_password=hashed_password)

    # Lưu vào database
    db_user.roles.append(customer_role)
    db_session.add(db_user)
    db_session.commit()
    db_session.refresh(db_user)

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
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Người dùng không tồn tại")

    role = roles_service.get_role_by_id(db_session, role_id=role_id)
    if not role:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Vai trò không tồn tại")

    if role in user.roles:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Người dùng đã có vai trò này")

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
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Người dùng không tồn tại")

    role = roles_service.get_role_by_id(db_session, role_id=role_id)
    if not role:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Vai trò không tồn tại")

    if role not in user.roles:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "Người dùng không có vai trò này"
        )

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


# hàm tạo user bởi admin
def create_user_by_admin(
    db_session: Session, *, user_in: AdminCreateUserRequest
) -> User:
    """
    [Admin] Tạo người dùng mới (nhân viên), tự động tạo mật khẩu tạm và gán vai trò.
    """
    existing_user = get_user_by_email(db_session, email=user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email đã tồn tại.",
        )

    # Tự động tạo một mật khẩu ngẫu nhiên, phức tạp
    temp_password = f"temp_password_{uuid.uuid4()}"
    hashed_password = get_password_hash(temp_password)

    user_data: Dict[str, Any] = user_in.model_dump(exclude={"role_id"})
    # Mặc định tài khoản được tạo bởi admin là đã xác thực email
    db_user = User(**user_data, hashed_password=hashed_password, is_email_verified=True)

    # Gán vai trò
    role_name = "nhân viên"  # Tên vai trò mặc định
    if user_in.role_id:
        role = roles_service.get_role_by_id(db_session, role_id=user_in.role_id)
        if not role:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND,
                f"Vai trò với ID {user_in.role_id} không tồn tại.",
            )
    else:
        role = roles_service.get_role_by_name(db_session, name=role_name)
        if not role:
            role_to_create = RoleCreate(
                name=role_name, description="Vai trò cho nhân viên"
            )
            role = roles_service.create_role(db_session, role_in=role_to_create)

    db_user.roles.append(role)
    db_session.add(db_user)
    db_session.commit()
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
    """
    Xóa mềm một người dùng.
    """
    user_to_delete.is_deleted = True
    user_to_delete.is_active = False  # Vô hiệu hóa người dùng khi xóa
    db_session.add(user_to_delete)
    db_session.commit()
    db_session.refresh(user_to_delete)
    return user_to_delete
