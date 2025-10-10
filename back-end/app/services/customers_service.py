# back-end/app/services/customers_service.py
import uuid
from typing import List, Optional
from sqlmodel import Session, select
from fastapi import HTTPException, status

from app.models.customers_model import Customer
from app.schemas.customers_schema import (
    CustomerCreate,
    CustomerCreateAtStore,
    CustomerUpdate,
)
from .base_service import BaseService


class CustomerService(BaseService[Customer, CustomerCreate, CustomerUpdate]):
    def __init__(self):
        super().__init__(Customer)

    def get_by_phone_number(
        self, db: Session, *, phone_number: str
    ) -> Optional[Customer]:
        statement = select(self.model).where(
            self.model.phone_number == phone_number, self.model.is_deleted == False
        )
        return db.exec(statement).first()

    def get_by_email(self, db: Session, *, email: str) -> Optional[Customer]:
        statement = select(self.model).where(
            self.model.email == email, self.model.is_deleted == False
        )
        return db.exec(statement).first()

    def find_or_create_offline_customer(
        self, db: Session, *, customer_in: CustomerCreateAtStore
    ) -> Customer:
        """
        [Dành cho nhân viên] Tìm khách hàng bằng SĐT, nếu không có thì tạo mới.
        Không liên quan đến tài khoản `User`.
        """
        customer = self.get_by_phone_number(db, phone_number=customer_in.phone_number)
        if customer:
            # Cập nhật thông tin nếu có
            if customer_in.full_name and not customer.full_name:
                customer.full_name = customer_in.full_name
            if customer_in.email and not customer.email:
                customer.email = customer_in.email
            db.add(customer)
            db.commit()
            db.refresh(customer)
            return customer

        # Nếu không tìm thấy, tạo mới hồ sơ customer vãng lai
        return self.create(db, obj_in=customer_in)


# Tạo một instance duy nhất
customers_service = CustomerService()
