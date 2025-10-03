# app/api/routers.py
from fastapi import APIRouter, FastAPI
from app.api import (
    roles_api,
    test_api,
    auth_api,
    users_api,
    services_api,
    schedules_api,
    products_api,
)

router = APIRouter()


router.include_router(test_api.router, prefix="/test", tags=["Test Endpoints"])
router.include_router(auth_api.router, prefix="/auth", tags=["Authentication"])
router.include_router(users_api.router, prefix="/users", tags=["Users"])
router.include_router(roles_api.router, prefix="/admin", tags=["Roles & Permissions"])
router.include_router(
    services_api.router, prefix="/services", tags=["Services & Categories"]
)
router.include_router(
    schedules_api.router, prefix="/admin", tags=["Schedules Management"]
)
router.include_router(products_api.router, prefix="/products", tags=["Products"])
