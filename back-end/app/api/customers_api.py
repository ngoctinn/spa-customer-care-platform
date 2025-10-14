# back-end/app/api/customers_api.py
import uuid
from typing import List
from fastapi import APIRouter, Depends, status, HTTPException, Response
from sqlmodel import Session

from app.core.dependencies import (
    get_db_session,
    get_current_user,
    get_current_admin_user,
)
from app.core.messages import ImageMessages
from app.schemas.customers_schema import (
    CustomerCreate,
    CustomerCreateAtStore,
    CustomerPublic,
    CustomerUpdate,
)
from app.models.users_model import User
from app.services.customers_service import customers_service
from app.services import images_service
from app.models.customers_model import Customer

router = APIRouter()


@router.put(
    "/me/profile",
    response_model=CustomerPublic,
    summary="Tạo hoặc Cập nhật hồ sơ khách hàng của tôi",
)
def create_or_update_my_customer_profile(
    *,
    session: Session = Depends(get_db_session),
    customer_in: CustomerUpdate,
    current_user: User = Depends(get_current_user),
):
    if customer_in.avatar_id:
        image = images_service.get_image_by_id(
            db=session, image_id=customer_in.avatar_id
        )
        if image.uploaded_by_user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=ImageMessages.IMAGE_PERMISSION_DENIED,
            )

    customer_profile = customers_service.get_or_create_for_user(
        db=session, user=current_user, profile_in=customer_in
    )
    return customer_profile


@router.post(
    "",
    response_model=CustomerPublic,
    # status_code sẽ được set động bên dưới
    dependencies=[Depends(get_current_admin_user)],
)
def create_customer(
    *,
    session: Session = Depends(get_db_session),
    customer_in: CustomerCreateAtStore,
    response: Response,
):
    customer, created = customers_service.find_or_create_offline_customer(
        db=session, customer_in=customer_in
    )
    if created:
        response.status_code = status.HTTP_201_CREATED
    else:
        response.status_code = status.HTTP_200_OK
    return customer


@router.get(
    "",
    response_model=List[CustomerPublic],
    dependencies=[Depends(get_current_admin_user)],
)
def get_all_customers(
    session: Session = Depends(get_db_session),
):
    return customers_service.get_all(db=session)


@router.get(
    "/{customer_id}",
    response_model=CustomerPublic,
    dependencies=[Depends(get_current_admin_user)],  # THÊM DEPENDENCY PHÂN QUYỀN
)
def get_customer_by_id(
    customer_id: uuid.UUID, session: Session = Depends(get_db_session)
):
    return customers_service.get_by_id(db=session, id=customer_id)


@router.put(
    "/{customer_id}",
    response_model=CustomerPublic,
    dependencies=[Depends(get_current_admin_user)],
)
def update_customer(
    customer_id: uuid.UUID,
    customer_in: CustomerUpdate,
    session: Session = Depends(get_db_session),
):
    customer = customers_service.get_by_id(db=session, id=customer_id)
    return customers_service.update(db=session, db_obj=customer, obj_in=customer_in)


@router.delete(
    "/{customer_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(get_current_admin_user)],
)
def delete_customer(customer_id: uuid.UUID, session: Session = Depends(get_db_session)):
    customer_to_delete = customers_service.get_by_id(db=session, id=customer_id)
    customers_service.delete(db=session, db_obj=customer_to_delete)
    return None
