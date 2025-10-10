# back-end/app/schemas/customers_schema.py
import re
import uuid
from typing import Optional
from sqlmodel import SQLModel, Field
from pydantic import EmailStr, field_validator, validator

from app.schemas.users_schema import UserPublic

# Regex cho SĐT Việt Nam
PHONE_REGEX = r"^(0|\+84)(\s|\.)?((3[2-9])|(5[689])|(7[06-9])|(8[1-689])|(9[0-46-9]))(\d)(\s|\.)?(\d{3})(\s|\.)?(\d{3})$"


class CustomerBase(SQLModel):
    phone_number: str = Field(..., max_length=20)
    email: EmailStr | None = Field(default=None)
    date_of_birth: str | None = None
    gender: str | None = Field(default=None, max_length=10)
    address: str | None = None
    note: str | None = None
    avatar_id: uuid.UUID | None = Field(default=None)

    @field_validator("phone_number")
    def validate_phone_number(cls, v):
        if not re.match(PHONE_REGEX, v):
            raise ValueError("Số điện thoại không hợp lệ")
        return v


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(SQLModel):
    phone_number: Optional[str] = Field(default=None, max_length=20)
    full_name: Optional[str] = Field(default=None, max_length=100)
    email: Optional[EmailStr] = Field(default=None)
    date_of_birth: Optional[str] = None
    gender: Optional[str] = Field(default=None, max_length=10)
    address: Optional[str] = None
    note: Optional[str] = None
    avatar_id: Optional[uuid.UUID] = None

    @field_validator("phone_number")
    def validate_phone_number(cls, v):
        if v is not None and not re.match(PHONE_REGEX, v):
            raise ValueError("Số điện thoại không hợp lệ")
        return v


class CustomerPublic(CustomerBase):
    id: uuid.UUID
    user: Optional[UserPublic] = None  # Hiển thị thông tin tài khoản online nếu có
