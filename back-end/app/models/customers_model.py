import uuid
from typing import TYPE_CHECKING, List, Optional
from sqlmodel import Field, SQLModel, Relationship
from app.models.base_model import BaseUUIDModel

if TYPE_CHECKING:
    from app.models.users_model import User
    from app.models.catalog_model import Image


class Customer(BaseUUIDModel, table=True):
    __tablename__ = "customers"

    phone_number: str = Field(index=True, nullable=False, unique=True)
    email: str | None = Field(default=None, index=True, unique=True, nullable=True)

    user_id: uuid.UUID | None = Field(foreign_key="user.id", nullable=True)
    user: Optional["User"] = Relationship(back_populates="customer_profile")

    date_of_birth: str | None = Field(default=None)
    gender: str | None = Field(default=None, max_length=10)
    address: str | None = None

    avatar_id: uuid.UUID | None = Field(default=None, foreign_key="image.id")
    avatar: Optional["Image"] = Relationship()
