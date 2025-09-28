# app/api/auth_api.py
from datetime import timedelta
from typing import Annotated
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session

from app.core.dependencies import get_db_session
from app.core.config import settings
from app.core import security
from app.schemas.users_schema import UserCreate, UserPublic
from app.services import users_service, auth_service  # Giả định bạn đã có service
from app.schemas.token_schema import Token


router = APIRouter()


@router.post("/token", response_model=Token)
def login_for_access_token(
    # Dùng OAuth2PasswordRequestForm để FastAPI tự động lấy username, password từ form body
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Session = Depends(get_db_session),
):
    """
    JWT token endpoint.

    Hàm này xử lý việc đăng nhập và trả về token JWT nếu thành công.
    """
    user = auth_service.authenticate(
        db_session=session, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sai email hoặc mật khẩu.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # Kiểm tra xem email đã được xác thực chưa
    if not user.is_email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email chưa được xác thực. Vui lòng kiểm tra hộp thư đến của bạn.",
        )
    # nếu user không hoạt động
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Người dùng không hoạt động.",
        )

    # 2. Tạo token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
async def create_user(
    *, session: Session = Depends(get_db_session), user_in: UserCreate, request: Request
):
    """
    Tạo người dùng mới.

    API này sẽ nhận dữ liệu người dùng, sau đó gọi đến service layer
    để thực hiện logic tạo mới và lưu vào database.
    """
    # Chỉ cần gọi hàm service đã được viết trước đó
    user = users_service.create_new_user(db_session=session, user_in=user_in)

    await auth_service.send_verification_email(user)

    return user


# --- Endpoint xác thực email (MỚI) ---
@router.get("/verify-email")
def verify_email(token: str, session: Session = Depends(get_db_session)):
    user_id = auth_service.verify_email_token(token)
    if not user_id:
        raise HTTPException(
            status_code=400, detail="Token không hợp lệ hoặc đã hết hạn"
        )

    user = users_service.get_user_by_id(db_session=session, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")

    auth_service.mark_email_as_verified(db_session=session, user=user)
    return {"message": "Xác thực email thành công!"}


# --- Endpoint chuyển hướng đăng nhập Google (MỚI) ---
@router.get("/login/google")
async def login_google(request: Request):
    redirect_uri = request.url_for("auth_google")
    return await auth_service.oauth.google.authorize_redirect(
        request, str(redirect_uri)
    )


# --- Endpoint callback của Google (MỚI) ---
@router.get("/auth/google", response_model=Token)
async def auth_google(request: Request, session: Session = Depends(get_db_session)):
    try:
        token = await auth_service.oauth.google.authorize_access_token(request)
    except Exception as e:
        raise HTTPException(status_code=401, detail="Không thể lấy token từ Google")

    user_info = token.get("userinfo")
    if not user_info:
        raise HTTPException(
            status_code=400, detail="Không thể lấy thông tin người dùng từ Google"
        )

    email = user_info["email"]
    user = users_service.get_user_by_email(db_session=session, email=email)

    # Nếu user chưa tồn tại, tạo mới user
    if not user:
        new_user_data = UserCreate(
            email=email,
            full_name=user_info.get("name"),
            # Mật khẩu ngẫu nhiên vì user sẽ đăng nhập qua Google
            password=f"google_oauth_{uuid.uuid4()}",
        )
        user = users_service.create_new_user(db_session=session, user_in=new_user_data)
        # Tự động xác thực email vì đây là email từ Google
        user = auth_service.mark_email_as_verified(db_session=session, user=user)

    # Tạo JWT token cho hệ thống của bạn
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}
