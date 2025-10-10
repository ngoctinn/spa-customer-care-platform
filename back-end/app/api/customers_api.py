# back-end/app/api/customers_api.py
import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.core.dependencies import get_db_session  # , get_current_admin_user
from app.schemas.customers_schema import CustomerCreate, CustomerPublic, CustomerUpdate
from app.services.customers_service import customers_service

router = APIRouter()


@router.post("", response_model=CustomerPublic, status_code=status.HTTP_201_CREATED)
def create_customer(
    *, session: Session = Depends(get_db_session), customer_in: CustomerCreate
):
    """[Nhân viên] Tạo một hồ sơ khách hàng mới (khách vãng lai)."""
    return customers_service.get_or_create_customer(db=session, customer_in=customer_in)


# Thêm các endpoint khác cho get_all, get_by_id, update, delete...


@router.get("", response_model=List[CustomerPublic])
def get_all_customers(session: Session = Depends(get_db_session)):
    """[Nhân viên] Lấy danh sách tất cả khách hàng."""
    return customers_service.get_all(db=session)


@router.get("/{customer_id}", response_model=CustomerPublic)
def get_customer_by_id(
    customer_id: uuid.UUID, session: Session = Depends(get_db_session)
):
    """[Nhân viên] Lấy thông tin chi tiết một khách hàng bằng ID."""
    customer = customers_service.get(db=session, id=customer_id)
    if not customer or customer.is_deleted:
        from fastapi import HTTPException

        raise HTTPException(status.HTTP_404_NOT_FOUND, "Khách hàng không tồn tại")
    return customer


@router.put("/{customer_id}", response_model=CustomerPublic)
def update_customer(
    customer_id: uuid.UUID,
    customer_in: CustomerUpdate,
    session: Session = Depends(get_db_session),
):
    """[Nhân viên] Cập nhật thông tin một khách hàng."""
    customer = customers_service.get(db=session, id=customer_id)
    if not customer or customer.is_deleted:
        from fastapi import HTTPException

        raise HTTPException(status.HTTP_404_NOT_FOUND, "Khách hàng không tồn tại")
    return customers_service.update(db=session, db_obj=customer, obj_in=customer_in)


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(customer_id: uuid.UUID, session: Session = Depends(get_db_session)):
    """[Nhân viên] Xóa mềm một khách hàng."""
    customer = customers_service.get(db=session, id=customer_id)
    if not customer or customer.is_deleted:
        from fastapi import HTTPException

        raise HTTPException(status.HTTP_404_NOT_FOUND, "Khách hàng không tồn tại")
    customers_service.remove(db=session, id=customer_id)
    return None
