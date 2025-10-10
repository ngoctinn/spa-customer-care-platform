# back-end/app/api/customers_api.py
import uuid
from typing import List
from fastapi import APIRouter, Depends, status, HTTPException
from sqlmodel import Session

from app.core.dependencies import (
    get_db_session,
    get_current_user,
    get_current_admin_user,
)
from app.schemas.customers_schema import CustomerCreate, CustomerPublic, CustomerUpdate
from app.models.users_model import User
from app.services.customers_service import customers_service
from app.services import images_service

router = APIRouter()


# Endpoint cho người dùng tự cập nhật hồ sơ của mình
@router.put(
    "/me/profile",
    response_model=CustomerPublic,
    summary="Cập nhật hồ sơ khách hàng của tôi",
)
def update_my_customer_profile(
    *,
    session: Session = Depends(get_db_session),
    customer_in: CustomerUpdate,
    current_user: User = Depends(get_current_user),
):
    """
    Người dùng đã đăng nhập tự cập nhật thông tin hồ sơ khách hàng của mình.
    Bao gồm cả việc thay đổi ảnh đại diện.
    """
    customer_profile = current_user.customer_profile
    if not customer_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy hồ sơ khách hàng cho người dùng này.",
        )

    # Logic kiểm tra quyền sở hữu ảnh đại diện
    if customer_in.avatar_id:
        image = images_service.get_image_by_id(
            db=session, image_id=customer_in.avatar_id
        )
        if image.uploaded_by_user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không có quyền sử dụng hình ảnh này làm ảnh đại diện.",
            )

    return customers_service.update(
        db=session, db_obj=customer_profile, obj_in=customer_in
    )


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
