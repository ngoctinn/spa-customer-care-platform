# back-end/app/schemas/customers_schema.py
import re
import uuid
from typing import Optional, Annotated
from sqlmodel import SQLModel, Field
from pydantic import EmailStr, StringConstraints

from app.schemas.users_schema import UserPublic

PHONE_REGEX = r"^(0|\+84)(\s|\.)?((3[2-9])|(5[689])|(7[06-9])|(8[1-689])|(9[0-46-9]))(\d)(\s|\.)?(\d{3})(\s|\.)?(\d{3})$"
PhoneNumber = Annotated[str, StringConstraints(max_length=20, pattern=PHONE_REGEX)]


class CustomerBase(SQLModel):
    phone_number: PhoneNumber = Field(default=None)
    full_name: str | None = Field(default=None, max_length=100)
    date_of_birth: str | None = None
    gender: str | None = Field(default=None, max_length=10)
    address: str | None = None
    note: str | None = None
    avatar_id: uuid.UUID | None = Field(default=None)


class CustomerCreateAtStore(SQLModel):
    phone_number: PhoneNumber
    full_name: str | None = Field(default=None, max_length=100)


class CustomerCreate(CustomerBase):
    user_id: Optional[uuid.UUID] = None
    pass


class CustomerUpdate(SQLModel):
    phone_number: Optional[PhoneNumber] = Field(default=None)
    full_name: Optional[str] = Field(default=None, max_length=100)
    date_of_birth: Optional[str] = None
    gender: Optional[str] = Field(default=None, max_length=10)
    address: Optional[str] = None
    note: Optional[str] = None
    avatar_id: Optional[uuid.UUID] = None


class CustomerPublic(CustomerBase):
    id: uuid.UUID
    user: Optional[UserPublic] = None
