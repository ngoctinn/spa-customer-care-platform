# app/models/users_model.py
from __future__ import annotations

import uuid
from sqlmodel import SQLModel, Field, Relationship
from app.models.base_model import BaseUUIDModel
from app.models.schedules_model import DefaultSchedule
from app.models.customers_model import Customer
from app.models.staff_model import StaffProfile, StaffTimeOff


class UserRole(SQLModel, table=True):
    __tablename__ = "user_role"
    user_id: uuid.UUID = Field(foreign_key="user.id", primary_key=True)
    role_id: uuid.UUID = Field(foreign_key="role.id", primary_key=True)


class RolePermission(SQLModel, table=True):
    __tablename__ = "role_permission"
    role_id: uuid.UUID = Field(foreign_key="role.id", primary_key=True)
    permission_id: uuid.UUID = Field(foreign_key="permission.id", primary_key=True)


class User(BaseUUIDModel, table=True):
    __tablename__ = "user"

    email: str = Field(index=True, nullable=False, unique=True)
    hashed_password: str = Field(nullable=False)
    is_active: bool = Field(default=True, nullable=False)
    is_email_verified: bool = Field(default=False, nullable=False)
    roles: list["Role"] = Relationship(back_populates="users", link_model=UserRole)

    default_schedules: list["DefaultSchedule"] = Relationship(
        back_populates="user", sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    customer_profile: "Customer" | None = Relationship(
        back_populates="user", sa_relationship_kwargs={"uselist": False}
    )
    staff_profile: "StaffProfile" | None = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete-orphan", "uselist": False},
    )

    # THÊM MỚI: Mối quan hệ ngược lại với StaffTimeOff
    approved_time_off_requests: list["StaffTimeOff"] = Relationship(
        back_populates="approver"
    )

    @property
    def is_admin(self) -> bool:
        return any(role.name == "admin" for role in self.roles)

    @property
    def full_name(self) -> str | None:
        if self.staff_profile and self.staff_profile.full_name:
            return self.staff_profile.full_name
        if self.customer_profile and self.customer_profile.full_name:
            return self.customer_profile.full_name
        return None


class Role(BaseUUIDModel, table=True):
    __tablename__ = "role"
    name: str = Field(index=True, nullable=False, unique=True)
    description: str | None = Field(default=None, nullable=True)
    users: list[User] = Relationship(back_populates="roles", link_model=UserRole)
    permissions: list["Permission"] = Relationship(
        back_populates="roles", link_model=RolePermission
    )


class Permission(BaseUUIDModel, table=True):
    __tablename__ = "permission"
    name: str = Field(index=True, nullable=False, unique=True)
    description: str | None = Field(default=None, nullable=True)
    roles: list[Role] = Relationship(
        back_populates="permissions", link_model=RolePermission
    )
