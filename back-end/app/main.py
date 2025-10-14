from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.sessions import SessionMiddleware
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

from app.core.config import settings
from app.core.exceptions import AppException

from app.api.routers import router

from app.core import database


app = FastAPI(
    title="Spa Online Customer Care System",
    description="Backend API for the online customer care system for spas.",
    version="1.0.0",
)

app.add_middleware(ProxyHeadersMiddleware, trusted_hosts="*")

app.add_middleware(SessionMiddleware, same_site="lax", secret_key=settings.SECRET_KEY)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    """
    Xử lý các custom exception của ứng dụng và chuyển đổi thành JSONResponse.
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": True, "message": exc.message, "details": exc.details},
    )


@app.get("/", tags=["Health Check"])
def read_root():
    """Kiểm tra xem API có hoạt động không."""
    return {"status": "ok", "message": "Welcome to my FastAPI application!"}
