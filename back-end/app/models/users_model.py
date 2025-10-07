# app/models/users_model.py
from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy.orm import Mapped
from sqlmodel import Field, Relationship, SQLModel

from app.models.base_model import BaseUUIDModel

if TYPE_CHECKING:
    from app.models.schedules_model import DefaultSchedule


class UserRole(SQLModel, table=True):
    __tablename__ = "user_role"
    user_id: uuid.UUID = Field(
        foreign_key="user.id",
        primary_key=True,
    )
    role_id: uuid.UUID = Field(
        foreign_key="role.id",
        primary_key=True,
    )


class RolePermission(SQLModel, table=True):
    __tablename__ = "role_permission"
    role_id: uuid.UUID = Field(
        foreign_key="role.id",
        primary_key=True,
    )
    permission_id: uuid.UUID = Field(
        foreign_key="permission.id",
        primary_key=True,
    )


class User(BaseUUIDModel, table=True):
    __tablename__ = "user"

    email: str = Field(index=True, nullable=False, unique=True)
    phone: str | None = Field(default=None, index=True, unique=True, nullable=True)
    full_name: str | None = Field(default=None, nullable=True)
    hashed_password: str = Field(nullable=False)
    is_active: bool = Field(default=True, nullable=False)
    is_superuser: bool = Field(default=False, nullable=False)
    is_email_verified: bool = Field(default=False, nullable=False)

    # ✅ updated for SQLAlchemy 2.0
    roles: Mapped[list["Role"]] = Relationship(
        back_populates="users", link_model=UserRole
    )

    # ✅ updated for SQLAlchemy 2.0
    # Mối quan hệ một-nhiều: một User có thể có nhiều lịch mặc định
    default_schedules: Mapped[list["DefaultSchedule"]] = Relationship(
        back_populates="user", sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )


class Role(BaseUUIDModel, table=True):
    __tablename__ = "role"

    name: str = Field(index=True, nullable=False, unique=True)
    description: str | None = Field(default=None, nullable=True)

    # ✅ updated for SQLAlchemy 2.0
    users: Mapped[list["User"]] = Relationship(
        back_populates="roles", link_model=UserRole
    )
    # ✅ updated for SQLAlchemy 2.0
    permissions: Mapped[list["Permission"]] = Relationship(
        back_populates="roles", link_model=RolePermission
    )


class Permission(BaseUUIDModel, table=True):
    __tablename__ = "permission"

    name: str = Field(index=True, nullable=False, unique=True)
    description: str | None = Field(default=None, nullable=True)

    # ✅ updated for SQLAlchemy 2.0
    roles: Mapped[list["Role"]] = Relationship(
        back_populates="permissions", link_model=RolePermission
    )
