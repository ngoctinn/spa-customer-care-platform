# app/services/users_service.py
from typing import Any, Dict, List, Optional
import uuid

from fastapi import HTTPException, status
from sqlmodel import Session, select

from app.core.security import get_password_hash
from app.models.users_model import User
from app.models.customers_model import Customer
from app.services.customers_service import customers_service
from app.schemas.users_schema import (
    AdminCreateUserRequest,
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
    Nếu không tìm thấy hoặc đã bị xóa mềm, raise HTTP 404.
    """
    user = db_session.get(User, user_id)
    if not user or user.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User với ID {user_id} không được tìm thấy.",
        )
    return user


# =================================================================
# CÁC HÀM NGHIỆP VỤ (BUSINESS LOGIC)
# =================================================================


def create_online_user(db_session: Session, *, user_in: UserCreate) -> User:
    """
    Xử lý luồng đăng ký online (cả Email và Google).
    """
    if get_user_by_email(db_session, email=user_in.email):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Email đã được sử dụng.")

    hashed_password = get_password_hash(user_in.password)
    user_data = user_in.model_dump(exclude={"password"})

    db_user = User(**user_data, hashed_password=hashed_password)

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
    # SỬ DỤNG HÀM MỚI: Tự động xử lý 404
    user = get_user_by_id(db_session, user_id=user_id)
    role = roles_service.get_role_by_id(
        db_session, role_id=role_id
    )  # roles_service cũng sẽ được refactor

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
    role = roles_service.get_role_by_id(db_session, role_id=role_id)

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
    Đảm bảo toàn bộ quá trình là một giao tác nguyên tử.
    """
    # 1. Validations (Thực hiện kiểm tra trước khi ghi vào DB)
    if get_user_by_email(db_session, email=user_in.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email đã tồn tại.",
        )

    role = None
    if user_in.role_id:
        # get_object_or_404 sẽ tự raise lỗi nếu không tìm thấy
        role = roles_service.get_role_by_id(db_session, role_id=user_in.role_id)
    else:
        role = roles_service.get_role_by_name(db_session, name="nhân viên")

    # --- BẮT ĐẦU GIAO TÁC ---
    try:
        # 2. Chuẩn bị dữ liệu và các đối tượng
        temp_password = f"temp_password_{uuid.uuid4()}"
        hashed_password = get_password_hash(temp_password)
        user_data: Dict[str, Any] = user_in.model_dump(exclude={"role_id"})
        db_user = User(
            **user_data, hashed_password=hashed_password, is_email_verified=True
        )

        # Nếu vai trò "nhân viên" chưa có, tạo nó trong cùng giao tác
        if not role:
            role_to_create = RoleCreate(
                name="nhân viên", description="Vai trò cho nhân viên"
            )
            # Không commit ở đây
            role = roles_service.create_role(db_session, role_in=role_to_create)

        db_user.roles.append(role)
        db_session.add(db_user)

        # 3. Commit một lần duy nhất
        db_session.commit()

    except Exception as e:
        # Nếu có bất kỳ lỗi nào xảy ra, rollback toàn bộ thay đổi
        db_session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Không thể tạo người dùng do lỗi hệ thống: {e}",
        )
    # --- KẾT THÚC GIAO TÁC ---

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
