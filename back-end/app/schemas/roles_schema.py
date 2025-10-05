# app/schemas/roles_schema.py
import uuid

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
    model_config = {"from_attributes": True}

    permissions: list[PermissionPublic] = Field(default_factory=list)


class AssignPermissionToRole(SQLModel):
    permission_id: uuid.UUID


class AssignRoleToUser(SQLModel):
    role_id: uuid.UUID
