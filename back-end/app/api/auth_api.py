# app/api/auth_api.py
from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status, Response
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session

from app.core.dependencies import get_db_session
from app.core.config import settings
from app.core import security
from app.core.messages import AuthMessages
from app.schemas.users_schema import (
    ForgotPasswordRequest,
    ResetPasswordRequest,
    UserCreate,
    UserPublic,
)
from app.services import users_service, auth_service
from app.schemas.token_schema import Token

router = APIRouter()


@router.post("/token")
def login_for_access_token(
    response: Response,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Session = Depends(get_db_session),
):
    user = auth_service.authenticate(
        db_session=session, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=AuthMessages.INVALID_CREDENTIALS,
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=AuthMessages.EMAIL_NOT_VERIFIED,
        )
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=AuthMessages.USER_INACTIVE,
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )

    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        expires=int(access_token_expires.total_seconds()),
    )

    return {"message": AuthMessages.LOGIN_SUCCESS}


@router.post(
    "/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED
)
async def register_user(
    *, session: Session = Depends(get_db_session), user_in: UserCreate
):
    """
    Khách hàng tự đăng ký tài khoản online chỉ bằng Email và Mật khẩu.
    Luồng này CHỈ TẠO TÀI KHOẢN (User), KHÔNG tự động tạo Hồ sơ khách hàng (Customer).
    """
    user = users_service.create_online_user(db_session=session, user_in=user_in)

    await auth_service.send_verification_email(user)
    return user


@router.get("/verify-email")
def verify_email(token: str, session: Session = Depends(get_db_session)):
    user_id = auth_service.verify_email_token(token)
    if not user_id:
        raise HTTPException(status_code=400, detail=AuthMessages.INVALID_TOKEN)

    user = users_service.get_user_by_id(db_session=session, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail=AuthMessages.INVALID_TOKEN)

    auth_service.mark_email_as_verified(db_session=session, user=user)
    return {"message": AuthMessages.EMAIL_VERIFIED_SUCCESS}


@router.get("/login/google")
async def login_google(request: Request):
    redirect_uri = request.url_for("auth_google")
    return await auth_service.oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/google")
async def auth_google(
    request: Request, response: Response, session: Session = Depends(get_db_session)
):
    try:
        user = await auth_service.handle_google_login_or_register(
            request=request, db_session=session
        )

        if not user:
            error_url = f"{settings.FRONTEND_URL}/auth/login?error=google_failed"
            return RedirectResponse(url=error_url)

        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = security.create_access_token(
            data={"sub": str(user.id)}, expires_delta=access_token_expires
        )

        response.set_cookie(
            key="access_token",
            value=f"Bearer {access_token}",
            httponly=True,
            expires=int(access_token_expires.total_seconds()),
            samesite="lax",
        )

        success_url = f"{settings.FRONTEND_URL}/dashboard"
        return RedirectResponse(url=success_url, headers=response.headers)

    except HTTPException as e:
        # stringify detail safely before manipulating
        error_detail = str(e.detail).replace(" ", "_").lower()
        error_url = f"{settings.FRONTEND_URL}/auth/login?error={error_detail}"
        return RedirectResponse(url=error_url)


@router.post("/forgot-password")
async def forgot_password(
    *, session: Session = Depends(get_db_session), body: ForgotPasswordRequest
):
    user = users_service.get_user_by_email(db_session=session, email=body.email)
    if user:
        await auth_service.send_password_reset_email(user)
    return {"message": AuthMessages.PASSWORD_RESET_EMAIL_SENT}


@router.post("/reset-password")
def reset_password(
    *, session: Session = Depends(get_db_session), body: ResetPasswordRequest
):
    user_id = auth_service.verify_password_reset_token(body.token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=AuthMessages.INVALID_TOKEN,
        )

    user = users_service.get_user_by_id(db_session=session, user_id=user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=AuthMessages.INVALID_TOKEN,
        )

    auth_service.reset_user_password(
        db_session=session, user=user, new_password=body.new_password
    )
    return {"message": AuthMessages.PASSWORD_RESET_SUCCESS}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="access_token")
    return {"message": AuthMessages.LOGOUT_SUCCESS}
