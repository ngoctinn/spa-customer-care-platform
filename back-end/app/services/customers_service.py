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
            # Nếu khách hàng đã tồn tại, chỉ cập nhật các trường còn thiếu
            # mà không ghi đè dữ liệu đã có.
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

        # Nếu không tìm thấy, tạo mới hồ sơ customer vãng lai từ schema CustomerCreate
        # để đảm bảo tất cả các trường đều được xử lý nếu cần
        new_customer_schema = CustomerCreate(**customer_in.model_dump())
        return self.create(db, obj_in=new_customer_schema)


# Tạo một instance duy nhất
customers_service = CustomerService()
