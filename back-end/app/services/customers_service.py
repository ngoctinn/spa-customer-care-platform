# app/services/customers_service.py
import uuid
from typing import List, Optional, Tuple

from fastapi import HTTPException, status
from sqlalchemy.orm import selectinload, Load
from sqlmodel import Session, select

from app.core.messages import CustomerMessages
from app.models.customers_model import Customer
from app.models.users_model import User
from app.models.catalog_model import Image
from app.schemas.customers_schema import (
    CustomerCreate,
    CustomerCreateAtStore,
    CustomerUpdate,
)
from .base_service import BaseService


class CustomerService(BaseService[Customer, CustomerCreate, CustomerUpdate]):
    def __init__(self):
        super().__init__(Customer)

    def _get_load_options(self) -> List[Load]:
        """Tải các mối quan hệ cần thiết cho Customer."""
        return [
            selectinload(Customer.user),
            selectinload(Customer.avatar),
        ]

    def _filter_relationships(self, customer: Customer) -> Customer:
        """Lọc các mối quan hệ soft-deleted."""
        if customer.user and customer.user.is_deleted:
            customer.user = None
            customer.user_id = None
        if customer.avatar and customer.avatar.is_deleted:
            customer.avatar = None
            customer.avatar_id = None
        return customer

    def get_by_phone_number(
        self, db: Session, *, phone_number: str
    ) -> Optional[Customer]:
        statement = (
            select(self.model)
            .where(
                self.model.phone_number == phone_number, self.model.is_deleted == False
            )
            .options(*self._get_load_options())
        )
        customer = db.exec(statement).first()
        if customer:
            return self._filter_relationships(customer)
        return None

    def get_by_user_id(self, db: Session, *, user_id: uuid.UUID) -> Optional[Customer]:
        """Lấy hồ sơ khách hàng bằng user_id."""
        statement = (
            select(self.model)
            .where(self.model.user_id == user_id, self.model.is_deleted == False)
            .options(*self._get_load_options())
        )
        customer = db.exec(statement).first()
        if customer:
            return self._filter_relationships(customer)
        return None

    def find_or_create_offline_customer(
        self, db: Session, *, customer_in: CustomerCreateAtStore
    ) -> Tuple[Customer, bool]:
        """
        Tìm khách hàng bằng SĐT. Nếu tồn tại, trả về khách hàng đó.
        Nếu không, tạo mới và trả về.
        Trả về một tuple (customer, created_flag).
        """
        customer = self.get_by_phone_number(db, phone_number=customer_in.phone_number)
        if customer:
            updated = False
            if customer_in.full_name and not customer.full_name:
                customer.full_name = customer_in.full_name
                updated = True
            if updated:
                db.add(customer)
                db.commit()
                db.refresh(customer)
            return customer, False

        new_customer_schema = CustomerCreate(**customer_in.model_dump())
        new_customer = self.create(db, obj_in=new_customer_schema)
        return (
            self.get_by_id(db, id=new_customer.id),
            True,
        )

    # --- HÀM ĐÃ ĐƯỢC DI CHUYỂN VÀO TRONG CLASS ---

    def get_or_create_for_user(
        self, db: Session, *, user: User, profile_in: CustomerUpdate
    ) -> Customer:
        # Lấy hồ sơ hiện tại của người dùng (nếu có)
        customer_profile = self.get_by_user_id(db, user_id=user.id)
        profile_data = profile_in.model_dump(exclude_unset=True)

        if profile_in.phone_number:
            # Tìm xem có hồ sơ nào khác dùng SĐT này không
            existing_phone_profile = self.get_by_phone_number(
                db, phone_number=profile_in.phone_number
            )

            if existing_phone_profile:
                # Nếu SĐT đã tồn tại
                if (
                    customer_profile
                    and existing_phone_profile.id != customer_profile.id
                ):
                    # Người dùng đã có hồ sơ và đang cố đổi sang SĐT của người khác -> Lỗi
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=CustomerMessages.PHONE_NUMBER_EXISTS,
                    )

                if not customer_profile and existing_phone_profile.user_id:
                    # Người dùng chưa có hồ sơ và SĐT này đã được gán cho 1 user khác -> Lỗi
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=CustomerMessages.PHONE_NUMBER_LINKED_TO_ANOTHER_ACCOUNT,
                    )

                if not customer_profile and not existing_phone_profile.user_id:
                    # **KỊCH BẢN GÁN SĐT TỒN TẠI**
                    # Người dùng chưa có hồ sơ và SĐT này là của khách vãng lai
                    # -> Gán hồ sơ khách vãng lai này cho user hiện tại và cập nhật
                    existing_phone_profile.user_id = user.id
                    return self.update(
                        db, db_obj=existing_phone_profile, obj_in=profile_in
                    )

        # Nếu các điều kiện trên không xảy ra, đi theo luồng cũ
        if customer_profile:
            # Cập nhật hồ sơ hiện có
            return self.update(db, db_obj=customer_profile, obj_in=profile_in)
        else:
            # Tạo mới hồ sơ
            if not profile_in.phone_number:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                    detail=CustomerMessages.PHONE_NUMBER_REQUIRED,
                )

            profile_data["user_id"] = user.id
            create_schema = CustomerCreate(**profile_data)
            return self.create(db, obj_in=create_schema)


customers_service = CustomerService()
