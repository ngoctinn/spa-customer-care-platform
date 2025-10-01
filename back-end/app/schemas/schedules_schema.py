# app/schemas/schedules_schema.py
from pydantic import BaseModel, Field, model_validator
import datetime
from typing import List


# Schema cơ sở, chứa các trường chung
class DefaultScheduleBase(BaseModel):
    day_of_week: int = Field(..., ge=1, le=7, description="1: T2, 2: T3, ..., 7: CN")
    is_active: bool = Field(default=False)
    start_time: datetime.time | None = None
    end_time: datetime.time | None = None

    # Validator để kiểm tra logic thời gian
    @model_validator(mode="after")
    def validate_times(self) -> "DefaultScheduleBase":
        if self.is_active:
            if self.start_time is None or self.end_time is None:
                raise ValueError(
                    "start_time và end_time là bắt buộc khi ngày làm việc active"
                )
            if self.start_time >= self.end_time:
                raise ValueError("start_time phải nhỏ hơn end_time")
        else:
            # Nếu không active, tự động set thời gian về None
            self.start_time = None
            self.end_time = None
        return self


# Schema để hiển thị cho client (response)
class DefaultSchedulePublic(DefaultScheduleBase):
    pass


# Schema để client gửi lên khi cập nhật (PUT request)
# Chúng ta sẽ nhận một danh sách các object DefaultScheduleBase
class DefaultScheduleUpdate(BaseModel):
    schedules: List[DefaultScheduleBase]
