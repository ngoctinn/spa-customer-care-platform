from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings


from app.api.routers import router

from app.core import database


app = FastAPI(
    title="Spa Online Customer Care System",
    description="Backend API for the online customer care system for spas.",
    version="1.0.0",
)



app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/", tags=["Health Check"])
def read_root():
    """Kiểm tra xem API có hoạt động không."""
    return {"status": "ok", "message": "Welcome to my FastAPI application!"}

