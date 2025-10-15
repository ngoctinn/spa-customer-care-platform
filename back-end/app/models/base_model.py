# app/models/base_model.py
import uuid
from datetime import datetime, timezone

from sqlmodel import SQLModel, Field, func


class BaseUUIDModel(SQLModel):
    id: uuid.UUID = Field(
        default_factory=uuid.uuid4, primary_key=True, index=True, nullable=False
    )
    # Thời điểm tạo: để DB gán giá trị server-side nhằm tránh sự khác nhau
    # giữa máy client và server; loại bỏ default_factory Python để tránh bất đồng.
    created_at: datetime = Field(
        nullable=False, sa_column_kwargs={"server_default": func.now()}
    )

    # Thời điểm cập nhật: để DB tự cập nhật khi row thay đổi (onupdate)
    updated_at: datetime = Field(
        nullable=False,
        sa_column_kwargs={"server_default": func.now(), "onupdate": func.now()},
    )
    is_deleted: bool = Field(default=False, nullable=False, index=True)
