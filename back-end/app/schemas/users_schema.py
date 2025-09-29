# app/schemas/users_schema.py

import uuid
import re
from typing import List, Optional

from pydantic import EmailStr, Field, field_validator
from sqlmodel import SQLModel

from app.schemas.roles_schema import RolePublic, RolePublicWithPermissions


# =================================================================
# SCHEMAS CHO USER
# =================================================================


class UserBase(SQLModel):
    email: EmailStr  # Tự động validate định dạng email
    phone: str | None = Field(
        default=None,
        max_length=15,
        # Ví dụ về regex cho SĐT Việt Nam
        pattern=r"^(0|\+84)(\s|\.)?((3[2-9])|(5[689])|(7[06-9])|(8[1-689])|(9[0-46-9]))(\d)(\s|\.)?(\d{3})(\s|\.)?(\d{3})$",
    )
    full_name: Optional[str] = Field(default=None, max_length=100)


class UserCreate(UserBase):
    password: str = Field(min_length=8, description="Mật khẩu phải có ít nhất 8 ký tự")

    @field_validator("password")
    def validate_password(cls, v):
        # Ví dụ: yêu cầu mật khẩu có cả chữ và số
        if not re.search(r"[A-Za-z]", v) or not re.search(r"[0-9]", v):
            raise ValueError("Mật khẩu phải chứa cả chữ và số")
        return v


class UserUpdateMe(SQLModel):
    email: EmailStr | None = Field(default=None, max_length=255)
    full_name: str | None = Field(default=None, max_length=100)
    phone: str | None = Field(
        default=None,
        max_length=15,
        pattern=r"^(0|\+84)(\s|\.)?((3[2-9])|(5[689])|(7[06-9])|(8[1-689])|(9[0-46-9]))(\d)(\s|\.)?(\d{3})(\s|\.)?(\d{3})$",
    )


# Schema chuyên biệt cho việc cập nhật mật khẩu
class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=40)
    new_password: str = Field(min_length=8, max_length=40)

# Schema cho reset mật khẩu
class ForgotPasswordRequest(SQLModel):
    email: EmailStr

class ResetPasswordRequest(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=40)

    @field_validator("new_password")
    def validate_new_password(cls, v):
        # Ví dụ: yêu cầu mật khẩu có cả chữ và số
        if not re.search(r"[A-Za-z]", v) or not re.search(r"[0-9]", v):
            raise ValueError("Mật khẩu phải chứa cả chữ và số")
        return v
    


# Schema hiển thị thông tin công khai của người dùng (dùng làm response_model)
class UserPublic(UserBase):
    id: uuid.UUID
    is_active: bool
    is_superuser: bool


# Schema hiển thị thông tin người dùng KÈM THEO vai trò và quyền của họ
class UserPublicWithRolesAndPermissions(UserPublic):
    roles: List[RolePublicWithPermissions] = []


# Cập nhật tham chiếu
UserPublicWithRolesAndPermissions.model_rebuild()
