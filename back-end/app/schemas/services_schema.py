# back-end/app/schemas/services_schema.py
from typing import Optional, List
from sqlmodel import SQLModel, Field
import uuid


# =================================================================
# SCHEMAS CHO HÌNH ẢNH DỊCH VỤ
# =================================================================
class ServiceImageBase(SQLModel):
    alt_text: str | None = Field(
        default=None, description="Văn bản thay thế cho hình ảnh"
    )
    is_primary: bool = Field(default=False, description="Đánh dấu hình ảnh chính")


class ServiceImagePublic(ServiceImageBase):
    id: uuid.UUID
    url: str


# =================================================================
# SCHEMAS CHO DANH MỤC DỊCH VỤ
# =================================================================
class ServiceCategoryBase(SQLModel):
    name: str = Field(max_length=100, description="Tên danh mục dịch vụ")
    description: str | None


class ServiceCategoryCreate(ServiceCategoryBase):
    pass


class ServiceCategoryUpdate(SQLModel):
    name: Optional[str] = Field(default=None, max_length=100)
    description: Optional[str] = None


class ServiceCategoryPublic(ServiceCategoryBase):
    id: uuid.UUID


# =================================================================
# SCHEMAS CHO DỊCH VỤ
# =================================================================
class ServiceBase(SQLModel):
    name: str = Field(max_length=100)
    description: str
    price: float = Field(gt=0, description="Giá dịch vụ phải lớn hơn 0")
    duration_minutes: int = Field(
        gt=0, description="Thời lượng dịch vụ (phút) phải lớn hơn 0"
    )
    preparation_notes: str | None
    aftercare_instructions: str | None
    contraindications: str | None
    category_id: uuid.UUID = Field(foreign_key="service_category.id")


class ServiceCreate(ServiceBase):
    # Không cần trường images ở đây vì file sẽ được xử lý riêng
    pass


class ServiceUpdate(SQLModel):
    name: str | None = Field(default=None, max_length=100)
    description: str | None = Field(default=None)
    price: float | None = Field(default=None, gt=0)
    duration_minutes: int | None = Field(default=None, gt=0)
    preparation_notes: str | None = Field(default=None)
    aftercare_instructions: str | None = Field(default=None)
    contraindications: str | None = Field(default=None)
    category_id: uuid.UUID | None = Field(default=None)


class ServicePublic(ServiceBase):
    id: uuid.UUID


# Schema hiển thị đầy đủ thông tin dịch vụ kèm theo danh mục và hình ảnh
class ServicePublicWithDetails(ServicePublic):
    category: ServiceCategoryPublic
    images: List[ServiceImagePublic] = []


# Schema hiển thị danh mục kèm theo các dịch vụ
class ServiceCategoryPublicWithServices(ServiceCategoryPublic):
    services: List[ServicePublic] = []
