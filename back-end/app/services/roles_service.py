# app/services/roles_service.py
import uuid
from typing import List
from sqlmodel import Session, select

from app.core.messages import RoleMessages
from app.core.exceptions import RoleExceptions
from app.models.users_model import Role, Permission
from app.schemas.roles_schema import PermissionCreate, RoleCreate, RoleUpdate


# =================================================================
# PERMISSION SERVICE
# =================================================================
def create_permission(
    db_session: Session, *, permission_in: "PermissionCreate"
) -> Permission:
    """Tạo một quyền mới nếu chưa tồn tại."""
    permission = db_session.exec(
        select(Permission).where(Permission.name == permission_in.name)
    ).first()
    if permission:
        raise RoleExceptions.permission_already_exists()
    permission = Permission.model_validate(permission_in)
    db_session.add(permission)
    db_session.commit()
    db_session.refresh(permission)
    return permission


def get_all_permissions(db_session: Session) -> List[Permission]:
    """Lấy danh sách tất cả các quyền."""
    return db_session.exec(select(Permission)).all()


# =================================================================
# ROLE SERVICES
# =================================================================


def get_role_by_name(db_session: Session, *, name: str) -> Role | None:
    """Tìm một vai trò trong database bằng tên."""
    return db_session.exec(select(Role).where(Role.name == name)).first()


def get_role_by_id(db_session: Session, *, role_id: uuid.UUID) -> Role:
    """
    Tìm một vai trò bằng ID.
    Nếu không tìm thấy, raise exception.
    """
    role = db_session.get(Role, role_id)
    if not role:
        raise RoleExceptions.role_not_found()
    return role


def create_role(db_session: Session, *, role_in: "RoleCreate") -> Role:
    """Tạo một vai trò mới nếu chưa tồn tại."""
    role = get_role_by_name(db_session, name=role_in.name)
    if role:
        raise RoleExceptions.role_already_exists()

    role = Role.model_validate(role_in)
    db_session.add(role)
    db_session.commit()
    db_session.refresh(role)
    return role


def get_all_roles(db_session: Session) -> List[Role]:
    """Lấy danh sách tất cả vai trò."""
    return db_session.exec(select(Role)).all()


def update_role(db_session: Session, *, db_role: Role, role_in: "RoleUpdate") -> Role:
    """Cập nhật thông tin một vai trò."""
    # Kiểm tra xem tên vai trò moi có bị trùng với vai trò khác không
    if role_in.name and role_in.name != db_role.name:
        existing_role = get_role_by_name(db_session, name=role_in.name)
        if existing_role:
            raise RoleExceptions.role_name_already_exists()
    role_data = role_in.model_dump(exclude_unset=True)
    for key, value in role_data.items():
        setattr(db_role, key, value)

    db_session.add(db_role)
    db_session.commit()
    db_session.refresh(db_role)
    return db_role


def delete_role(db_session: Session, *, db_role: Role):
    """Xóa một vai trò khỏi database."""
    # Optional: Kiểm tra xem vai trò này còn được gán cho user nào không
    if db_role.users:
        raise RoleExceptions.role_in_use()

    db_session.delete(db_role)
    db_session.commit()
    return {"ok": True}


def assign_permission_to_role(
    db_session: Session, *, role_id: uuid.UUID, permission_id: uuid.UUID
) -> Role:
    """Gán một quyền cho một vai trò."""
    role = db_session.get(Role, role_id)
    if not role:
        raise RoleExceptions.role_not_found()

    permission = db_session.get(Permission, permission_id)
    if not permission:
        raise RoleExceptions.permission_not_found()

    if permission in role.permissions:
        raise RoleExceptions.permission_already_assigned()

    role.permissions.append(permission)
    db_session.add(role)
    db_session.commit()
    db_session.refresh(role)
    return role


def remove_permission_from_role(
    db_session: Session, *, role_id: uuid.UUID, permission_id: uuid.UUID
) -> Role:
    """Xóa một quyền khỏi vai trò."""
    role = db_session.get(Role, role_id)
    if not role:
        raise RoleExceptions.role_not_found()

    permission = db_session.get(Permission, permission_id)
    if not permission:
        raise RoleExceptions.permission_not_found()

    if permission not in role.permissions:
        raise RoleExceptions.permission_not_in_role()

    role.permissions.remove(permission)
    db_session.add(role)
    db_session.commit()
    db_session.refresh(role)
    return role
