# back-end/app/services/customers_service.py
import uuid
from typing import List, Optional
from sqlmodel import Session, select
from fastapi import HTTPException, status

from app.models.customers_model import Customer
from app.schemas.customers_schema import CustomerCreate, CustomerUpdate
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

    def get_or_create_customer(
        self, db: Session, *, customer_in: CustomerCreate
    ) -> Customer:
        """
        Tìm khách hàng bằng SĐT, nếu không có thì tạo mới (Hồ sơ tối thiểu).
        """
        customer = self.get_by_phone_number(db, phone_number=customer_in.phone_number)
        if customer:
            return customer

        return self.create(db, obj_in=customer_in)


# Tạo một instance duy nhất
customers_service = CustomerService()
