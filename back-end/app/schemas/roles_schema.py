# app/schemas/roles_schema.py
import uuid
from typing import List
from sqlmodel import Field, SQLModel


# ==================================================================
# SCHEMAS CHO PERMISSION
# ==================================================================
class PermissionBase(SQLModel):
    name: str = Field(min_length=3, max_length=100, unique=True)
    description: str | None = Field(default=None, max_length=255)


class PermissionCreate(PermissionBase):
    pass


class PermissionPublic(PermissionBase):
    id: uuid.UUID


# ==================================================================
# SCHEMAS CHO ROLE
# ==================================================================
class RoleBase(SQLModel):
    name: str = Field(min_length=3, max_length=50, unique=True)
    description: str | None = Field(default=None, max_length=255)


class RoleCreate(RoleBase):
    pass


class RoleUpdate(SQLModel):
    name: str | None = Field(default=None, min_length=3, max_length=50)
    description: str | None = Field(default=None, max_length=255)


class RolePublic(RoleBase):
    id: uuid.UUID


class RolePublicWithPermissions(RolePublic):
    permissions: List[PermissionPublic] = []


class AssignPermissionToRole(SQLModel):
    permission_id: uuid.UUID


class AssignRoleToUser(SQLModel):
    role_id: uuid.UUID
