# app/schemas/token_schema.py
from typing import Optional
from sqlmodel import SQLModel


# Schema cho dữ liệu trả về khi login thành công
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"  # Luôn là "bearer"


# Schema cho dữ liệu chứa bên trong token
class TokenData(SQLModel):
    email: Optional[str] = None
