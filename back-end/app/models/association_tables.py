# app/models/association_tables.py
import uuid
from sqlmodel import SQLModel, Field


class ServiceCategoryLink(SQLModel, table=True):
    __tablename__ = "service_category_link"
    service_id: uuid.UUID = Field(
        foreign_key="service.id",
        primary_key=True,
    )
    category_id: uuid.UUID = Field(
        foreign_key="category.id",
        primary_key=True,
    )
