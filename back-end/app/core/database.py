# core/database.py
from sqlmodel import SQLModel, Session, create_engine, inspect
from .config import settings
from app.models.users_model import User, Role, UserRole, RolePermission


engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    echo=False,
)
