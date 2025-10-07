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


class ProductCategoryLink(SQLModel, table=True):
    __tablename__ = "product_category_link"
    product_id: uuid.UUID = Field(
        foreign_key="product.id",
        primary_key=True,
    )
    category_id: uuid.UUID = Field(
        foreign_key="category.id",
        primary_key=True,
    )


# =================================================================
# BẢNG LIÊN KẾT HÌNH ẢNH (MỚI)
# =================================================================


class ProductImageLink(SQLModel, table=True):
    __tablename__ = "product_image_link"
    product_id: uuid.UUID = Field(foreign_key="product.id", primary_key=True)
    image_id: uuid.UUID = Field(foreign_key="image.id", primary_key=True)


class ServiceImageLink(SQLModel, table=True):
    __tablename__ = "service_image_link"
    service_id: uuid.UUID = Field(foreign_key="service.id", primary_key=True)
    image_id: uuid.UUID = Field(foreign_key="image.id", primary_key=True)


class TreatmentPlanImageLink(SQLModel, table=True):
    __tablename__ = "treatment_plan_image_link"
    treatment_plan_id: uuid.UUID = Field(
        foreign_key="treatment_plan.id", primary_key=True
    )
    image_id: uuid.UUID = Field(foreign_key="image.id", primary_key=True)
