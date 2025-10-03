# app/utils/common.py
from typing import Type, TypeVar
import uuid
from sqlmodel import Session, SQLModel, select
from fastapi import HTTPException, status

# Generic TypeVar để hàm có thể hoạt động với bất kỳ model nào kế thừa từ SQLModel
ModelType = TypeVar("ModelType", bound=SQLModel)


def get_object_or_404(
    db: Session, *, model: Type[ModelType], obj_id: uuid.UUID
) -> ModelType:
    """
    Lấy một đối tượng từ DB bằng ID. Nếu không tồn tại, raise HTTP 404.
    Hàm này cũng tự động kiểm tra cờ is_deleted nếu model có thuộc tính này.
    """
    query = select(model).where(model.id == obj_id)

    # Tự động thêm điều kiện is_deleted nếu model có thuộc tính này
    if hasattr(model, "is_deleted"):
        # Giả định rằng cờ is_deleted là một cột boolean
        query = query.where(getattr(model, "is_deleted") == False)

    db_obj = db.exec(query).first()

    if db_obj is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{model.__name__} với ID {obj_id} không được tìm thấy.",
        )

    return db_obj
