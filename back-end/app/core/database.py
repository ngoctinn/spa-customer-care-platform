# core/database.py
from sqlmodel import SQLModel, Session, create_engine, inspect
from .config import settings

# THAY ĐỔI: Import tất cả các model tại đây để SQLAlchemy/SQLModel
# có thể nhận diện và xây dựng các mối quan hệ một cách chính xác.
from app.models.users_model import User, Role, UserRole, RolePermission
from app.models.schedules_model import DefaultSchedule
from app.models.catalog_model import Category, Image
from app.models.products_model import Product
from app.models.services_model import Service
from app.models.treatment_plans_model import TreatmentPlan, TreatmentPlanStep
from app.models.customers_model import Customer
from app.models.association_tables import (
    ServiceCategoryLink,
    ProductCategoryLink,
    ProductImageLink,
    ServiceImageLink,
    TreatmentPlanImageLink,
)


engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    echo=False,
)
