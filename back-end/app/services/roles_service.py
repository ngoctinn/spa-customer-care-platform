# app/services/roles_service.py
import uuid
from typing import List, Optional
from fastapi import HTTPException, status
from sqlmodel import Session, select
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
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Quyền đã tồn tại")
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


def get_role_by_name(db_session: Session, *, name: str) -> Optional[Role]:
    """Tìm một vai trò trong database bằng tên."""
    return db_session.exec(select(Role).where(Role.name == name)).first()


def get_role_by_id(db_session: Session, *, role_id: uuid.UUID) -> Role:
    """
    Tìm một vai trò bằng ID.
    Nếu không tìm thấy, raise HTTP 404.
    """
    role = db_session.get(Role, role_id)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Role với ID {role_id} không được tìm thấy.",
        )
    return role


def create_role(db_session: Session, *, role_in: "RoleCreate") -> Role:
    """Tạo một vai trò mới nếu chưa tồn tại."""
    role = get_role_by_name(db_session, name=role_in.name)
    if role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Vai trò đã tồn tại."
        )

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
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tên vai trò đã tồn tại.",
            )
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
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "Không thể xóa vai trò đang được sử dụng"
        )

    db_session.delete(db_role)
    db_session.commit()
    return {"ok": True}


def assign_permission_to_role(
    db_session: Session, *, role_id: uuid.UUID, permission_id: uuid.UUID
) -> Role:
    """Gán một quyền cho một vai trò."""
    role = db_session.get(Role, role_id)
    if not role:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Vai trò không tồn tại")

    permission = db_session.get(Permission, permission_id)
    if not permission:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Quyền không tồn tại")

    if permission in role.permissions:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "Quyền đã được gán cho vai trò này"
        )

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
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Vai trò không tồn tại")

    permission = db_session.get(Permission, permission_id)
    if not permission:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Quyền không tồn tại")

    if permission not in role.permissions:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "Quyền này không thuộc vai trò"
        )

    role.permissions.remove(permission)
    db_session.add(role)
    db_session.commit()
    db_session.refresh(role)
    return role
