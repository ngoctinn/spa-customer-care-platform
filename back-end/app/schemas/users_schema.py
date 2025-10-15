# app/schemas/users_schema.py
import uuid
import re

from pydantic import EmailStr, Field, field_validator
from sqlmodel import SQLModel

from app.schemas.roles_schema import RolePublic, RolePublicWithPermissions


class UserBase(SQLModel):
    email: EmailStr


class UserCreate(UserBase):
    password: str = Field(min_length=8, description="Mật khẩu phải có ít nhất 8 ký tự")
    # LOẠI BỎ: full_name không còn cần thiết trong luồng đăng ký ban đầu
    # full_name: str | None = Field(default=None, max_length=100)

    @field_validator("password")
    def validate_password(cls, v):
        if not re.search(r"[A-Za-z]", v) or not re.search(r"[0-9]", v):
            raise ValueError("Mật khẩu phải chứa cả chữ và số")
        return v


class AdminCreateStaffRequest(UserBase):
    full_name: str = Field(max_length=100)
    phone_number: str = Field(max_length=20)
    role_id: uuid.UUID | None = Field(default=None)


# ... các schema còn lại giữ nguyên ...
class UserUpdateMe(SQLModel):
    pass


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=40)
    new_password: str = Field(min_length=8, max_length=40)


class ForgotPasswordRequest(SQLModel):
    email: EmailStr


class ResetPasswordRequest(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=40)

    @field_validator("new_password")
    def validate_new_password(cls, v):
        if not re.search(r"[A-Za-z]", v) or not re.search(r"[0-9]", v):
            raise ValueError("Mật khẩu phải chứa cả chữ và số")
        return v


class LinkPhoneNumberRequest(SQLModel):
    phone_number: str = Field(
        max_length=20,
        pattern=r"^(0|\+84)(\s|\.)?((3[2-9])|(5[689])|(7[06-9])|(8[1-689])|(9[0-46-9]))(\d)(\s|\.)?(\d{3})(\s|\.)?(\d{3})$",
    )


class VerifyOTPRequest(LinkPhoneNumberRequest):
    otp: str = Field(..., min_length=6, max_length=6)


class UserPublic(UserBase):
    id: uuid.UUID
    is_active: bool
    is_deleted: bool = False
    full_name: str | None = None


class UserUpdateByAdmin(SQLModel):
    email: EmailStr | None = Field(default=None)
    is_active: bool | None = Field(default=None)


class UserPublicWithRolesAndPermissions(UserPublic):
    model_config = {"from_attributes": True}
    roles: list[RolePublicWithPermissions] = Field(default_factory=list)


UserPublicWithRolesAndPermissions.model_rebuild()
