# app/services/base_service.py
from typing import Generic, List, Type, TypeVar
import uuid
from pydantic import BaseModel
from sqlmodel import Session, SQLModel, select

from app.utils.common import get_object_or_404

# 1. Định nghĩa các Generic Types
# Giúp BaseService có thể hoạt động với bất kỳ Model và Schema nào
ModelType = TypeVar("ModelType", bound=SQLModel)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)


# 2. Xây dựng lớp BaseService chung
class BaseService(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, model: Type[ModelType]):
        """
        Khởi tạo service với một model SQLModel cụ thể.
        Ví dụ: super().__init__(Product)
        """
        self.model = model

    def get_all(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> List[ModelType]:
        """
        Lấy tất cả các đối tượng (chưa bị xóa mềm).
        Tự động kiểm tra cờ 'is_deleted'.
        """
        query = select(self.model).where(getattr(self.model, "is_deleted") == False)
        items = db.exec(query.offset(skip).limit(limit)).all()
        return items

    def get_by_id(self, db: Session, *, id: uuid.UUID) -> ModelType:
        """
        Lấy một đối tượng bằng ID, tự động báo lỗi 404 nếu không tìm thấy.
        """
        return get_object_or_404(db, model=self.model, obj_id=id)

    def create(self, db: Session, *, obj_in: CreateSchemaType) -> ModelType:
        """
        Tạo một đối tượng mới từ schema.
        Lưu ý: Hàm này chỉ xử lý việc tạo object cơ bản.
        Các logic phức tạp hơn (như gán relationships) sẽ được xử lý ở lớp con.
        """
        # Chuyển Pydantic schema thành dictionary
        obj_in_data = obj_in.model_dump()
        # Tạo instance của model từ dictionary
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
        """
        setattr(db_obj, "is_deleted", True)
        # Thêm dòng này để đảm bảo tính nhất quán (ví dụ: user bị xóa thì không active)
        if hasattr(db_obj, "is_active"):
            setattr(db_obj, "is_active", False)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
