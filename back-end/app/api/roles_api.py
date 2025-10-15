# app/api/roles_api.py
from typing import List
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.core.dependencies import (
    get_db_session,
    get_role_by_id_from_path,
)  # get_current_user, has_permission
from app.models.users_model import Role
from app.schemas.roles_schema import (
    AssignRoleToUser,
    RoleCreate,
    RolePublic,
    RolePublicWithPermissions,
    PermissionCreate,
    PermissionPublic,
    AssignPermissionToRole,
    RoleUpdate,
)
from app.schemas.users_schema import UserPublicWithRolesAndPermissions
from app.services import roles_service, users_service

router = APIRouter()

# Tạm thời chưa cần check permission, khi nào cần thì uncomment các dòng get_current_user và has_permission
# from app.models.users_model import User

# =============================================================
# ROLE ENDPOINTS
# ==============================================================


@router.post(
    "/roles", response_model=RolePublic
)  # , dependencies=[Depends(has_permission("manage_roles"))])
def create_new_role(*, db: Session = Depends(get_db_session), role_in: RoleCreate):
    """Tạo một vai trò mới (yêu cầu quyền 'manage_roles')."""
    return roles_service.create_role(db=db, role_in=role_in)


@router.get("/roles", response_model=List[RolePublicWithPermissions])
def get_all_roles_with_permissions(db: Session = Depends(get_db_session)):
    """Lấy danh sách tất cả các vai trò và quyền của chúng."""
    return roles_service.get_all_roles(db=db)


@router.get("/roles/{role_id}", response_model=RolePublicWithPermissions)
def get_role_details(role: Role = Depends(get_role_by_id_from_path)):
    """Lấy thông tin chi tiết của một vai trò bằng ID."""
    return role


@router.put("/roles/{role_id}", response_model=RolePublic)
def update_a_role(
    *,
    db: Session = Depends(get_db_session),
    role_in: RoleUpdate,
    role: Role = Depends(get_role_by_id_from_path)  # Tận dụng dependency
):
    """Cập nhật tên hoặc mô tả của một vai trò."""
    # Bây giờ không cần kiểm tra role tồn tại ở đây nữa
    return roles_service.update_role(
        db=db,
        db_role=role,
        role_in=role_in,  # Truyền thẳng db_role vào service
    )


@router.delete("/roles/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_a_role(
    *,
    db: Session = Depends(get_db_session),
    role: Role = Depends(get_role_by_id_from_path)
):
    """Xóa một vai trò."""
    roles_service.delete_role(db=db, db_role=role)
    return


# =============================================================
# PERMISSION ENDPOINTS
# ==============================================================


@router.post("/roles/{role_id}/permissions", response_model=RolePublicWithPermissions)
def assign_permission(
    *,
    db: Session = Depends(get_db_session),
    role_id: str,
    assignment: AssignPermissionToRole
):
    """Gán một quyền cho một vai trò."""
    return roles_service.assign_permission_to_role(
        db=db, role_id=role_id, permission_id=assignment.permission_id
    )


@router.delete(
    "/roles/{role_id}/permissions/{permission_id}",
    response_model=RolePublicWithPermissions,
)
def remove_permission(
    *,
    db: Session = Depends(get_db_session),
    role_id: uuid.UUID,
    permission_id: uuid.UUID
):
    """Xóa một quyền khỏi một vai trò."""
    return roles_service.remove_permission_from_role(
        db=db, role_id=role_id, permission_id=permission_id
    )


@router.post("/permissions", response_model=PermissionPublic)
def create_new_permission(
    *, db: Session = Depends(get_db_session), permission_in: PermissionCreate
):
    """Tạo một quyền mới."""
    return roles_service.create_permission(db=db, permission_in=permission_in)


@router.get("/permissions", response_model=List[PermissionPublic])
def get_all_permissions(db: Session = Depends(get_db_session)):
    """Lấy danh sách tất cả các quyền."""
    return roles_service.get_all_permissions(db=db)


# =================================================================
# USER-ROLE ASSIGNMENT ENDPOINTS
# =================================================================


@router.post("/users/{user_id}/roles", response_model=UserPublicWithRolesAndPermissions)
def assign_role_to_a_user(
    *,
    db: Session = Depends(get_db_session),
    user_id: uuid.UUID,
    assignment: AssignRoleToUser
):
    """Gán một vai trò cho người dùng (yêu cầu quyền admin)."""
    return users_service.assign_role_to_user(
        db=db, user_id=user_id, role_id=assignment.role_id
    )


# --- MỚI: Xóa vai trò khỏi user ---
@router.delete(
    "/users/{user_id}/roles/{role_id}", response_model=UserPublicWithRolesAndPermissions
)
def remove_role_from_a_user(
    *,
    db: Session = Depends(get_db_session),
    user_id: uuid.UUID,
    role_id: uuid.UUID
):
    """Xóa một vai trò khỏi người dùng (yêu cầu quyền admin)."""
    return users_service.remove_role_from_user(
        db=db, user_id=user_id, role_id=role_id
    )
