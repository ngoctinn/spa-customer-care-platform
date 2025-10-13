# app/services/customers_service.py (Mã đã Refactor)
import uuid
from typing import List, Optional
from sqlmodel import Session, select
from fastapi import HTTPException, status

# Thêm import Load từ sqlalchemy.orm
from sqlalchemy.orm import selectinload, Load

from app.models.customers_model import Customer
from app.models.users_model import User  # NEW: Import User for relationships
from app.models.catalog_model import Image  # NEW: Import Image for relationships
from app.schemas.customers_schema import (
    CustomerCreate,
    CustomerCreateAtStore,
    CustomerUpdate,
)
from .base_service import BaseService


class CustomerService(BaseService[Customer, CustomerCreate, CustomerUpdate]):
    def __init__(self):
        super().__init__(Customer)

    # --- BƯỚC 1: IMPLEMENT HOOK: Tải quan hệ ---
    def _get_load_options(self) -> List[Load]:
        """Tải các mối quan hệ cần thiết cho Customer."""
        return [
            selectinload(Customer.user),
            selectinload(Customer.avatar),
        ]

    # --- BƯỚC 2: IMPLEMENT HOOK: Lọc quan hệ soft-delete ---
    def _filter_relationships(self, customer: Customer) -> Customer:
        """Lọc các mối quan hệ soft-deleted."""
        # Lọc user soft-deleted
        if customer.user and customer.user.is_deleted:
            customer.user = None
            customer.user_id = None
        # Lọc avatar soft-deleted
        if customer.avatar and customer.avatar.is_deleted:
            customer.avatar = None
            customer.avatar_id = None

        return customer

    # --- CẬP NHẬT: get_by_phone_number (Sử dụng hooks để tải và lọc) ---
    def get_by_phone_number(
        self, db: Session, *, phone_number: str
    ) -> Optional[Customer]:
        # Tái sử dụng logic BaseService: áp dụng load options
        statement = (
            select(self.model)
            .where(
                self.model.phone_number == phone_number, self.model.is_deleted == False
            )
            .options(*self._get_load_options())
        )

        customer = db.exec(statement).first()

        if customer:
            # Áp dụng lọc quan hệ
            return self._filter_relationships(customer)
        return None

    # --- CẬP NHẬT: get_by_email (Sử dụng hooks để tải và lọc) ---
    def get_by_email(self, db: Session, *, email: str) -> Optional[Customer]:
        # Tái sử dụng logic BaseService: áp dụng load options
        statement = (
            select(self.model)
            .where(self.model.email == email, self.model.is_deleted == False)
            .options(*self._get_load_options())
        )

        customer = db.exec(statement).first()

        if customer:
            # Áp dụng lọc quan hệ
            return self._filter_relationships(customer)
        return None

    # --- CẬP NHẬT: find_or_create_offline_customer ---
    def find_or_create_offline_customer(
        self, db: Session, *, customer_in: CustomerCreateAtStore
    ) -> Customer:
        # get_by_phone_number đã được cập nhật để trả về model có relationship
        customer = self.get_by_phone_number(db, phone_number=customer_in.phone_number)

        if customer:
            # ... (giữ nguyên logic update)
            update_data = customer_in.model_dump(exclude_unset=True)
            updated = False
            if update_data.get("full_name") and not customer.full_name:
                customer.full_name = update_data["full_name"]
                updated = True
            if update_data.get("email") and not customer.email:
                customer.email = update_data["email"]
                updated = True

            if updated:
                db.add(customer)
                db.commit()
                db.refresh(customer)
            return customer

        # Create new customer profile
        new_customer_schema = CustomerCreate(**customer_in.model_dump())

        # Gọi BaseService.create, sau đó fetch lại bằng BaseService.get_by_id đã được enhanced
        new_customer = self.create(db, obj_in=new_customer_schema)

        return self.get_by_id(db, id=new_customer.id)  # SỬ DỤNG PHƯƠNG THỨC KẾ THỪA


customers_service = CustomerService()
