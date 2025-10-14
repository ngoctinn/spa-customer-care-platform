# app/services/base_service.py (REFRACTORED)
from typing import Generic, List, Type, TypeVar, Optional, Any
import uuid
from pydantic import BaseModel
from sqlmodel import Session, SQLModel, select, Field

# Thêm import cần thiết cho SQLAlchemy loading
from sqlalchemy.orm import Load
from app.core.exceptions import NotFoundError

# Thay thế cho get_object_or_404 vì chúng ta cần kiểm tra is_deleted và load relationships


# 1. Định nghĩa các Generic Types (Giữ nguyên)
ModelType = TypeVar("ModelType", bound=SQLModel)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)


# 2. Xây dựng lớp BaseService chung (Đã Refactor)
class BaseService(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, model: Type[ModelType]):
        self.model = model

    # --- BƯỚC 1: HƯỚC CHO CUSTOMIZATION (Sẽ được ghi đè ở lớp con) ---
    def _get_load_options(self) -> List[Load]:
        """
        [HOOK] Trả về các tùy chọn SQLAlchemy (ví dụ: selectinload)
        để tải các mối quan hệ cho model.
        """
        return []

    def _filter_relationships(self, db_obj: ModelType) -> ModelType:
        """
        [HOOK] Áp dụng các bộ lọc (ví dụ: lọc soft-deleted) cho
        các mối quan hệ đã được tải.
        """
        return db_obj

    # --- BƯỚC 2: CÁC PHƯƠNG THỨC TRUY VẤN CỐT LÕI ĐƯỢC CẢI TIẾN ---

    def get_all(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> List[ModelType]:
        """
        Lấy tất cả đối tượng, áp dụng load options, lọc soft-delete
        trên model chính và các quan hệ đã được tải.
        """
        # Áp dụng lọc is_deleted cho model chính
        query = (
            select(self.model)
            .where(getattr(self.model, "is_deleted") == False)
            .options(*self._get_load_options())  # Áp dụng load options
            .offset(skip)
            .limit(limit)
        )

        # Bắt buộc dùng .unique() khi có dùng relationship loading để tránh trùng lặp
        items = db.exec(query).unique().all()

        # Áp dụng bộ lọc/làm sạch quan hệ
        return [self._filter_relationships(item) for item in items]

    def get_by_id(self, db: Session, *, id: uuid.UUID) -> ModelType:
        """
        Lấy một đối tượng bằng ID, bao gồm load options và kiểm tra 404/is_deleted.
        """
        # Áp dụng lọc is_deleted cho model chính
        query = (
            select(self.model)
            .where(self.model.id == id, getattr(self.model, "is_deleted") == False)
            .options(*self._get_load_options())  # Áp dụng load options
        )

        db_obj = db.exec(query).unique().first()

        if db_obj is None:
            # Cải tiến: Sử dụng tên model trong thông báo lỗi
            raise NotFoundError(f"Không tìm thấy {self.model.__name__} với ID {id}.")

        # Áp dụng bộ lọc/làm sạch quan hệ
        return self._filter_relationships(db_obj)

    # --- (Các phương thức create, update, delete giữ nguyên) ---
    def create(self, db: Session, *, obj_in: CreateSchemaType) -> ModelType:
        """
        Tạo một đối tượng mới từ schema.
        [...]
        """
        obj_in_data = obj_in.model_dump()
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self, db: Session, *, db_obj: ModelType, obj_in: UpdateSchemaType
    ) -> ModelType:
        """
        Cập nhật một đối tượng trong DB từ schema.
        [...]
        """
        obj_data = obj_in.model_dump(exclude_unset=True)
        for field, value in obj_data.items():
            setattr(db_obj, field, value)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, *, db_obj: ModelType) -> ModelType:
        """
        Xóa mềm một đối tượng (đặt is_deleted = True).
        [...]
        """
        setattr(db_obj, "is_deleted", True)
        # Thêm dòng này để đảm bảo tính nhất quán (ví dụ: user bị xóa thì không active)
        if hasattr(db_obj, "is_active"):
            setattr(db_obj, "is_active", False)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
