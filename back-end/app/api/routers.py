# app/api/routers.py
from fastapi import APIRouter
from app.api import (
    roles_api,
    test_api,
    auth_api,
    users_api,
    services_api,
    schedules_api,
    products_api,
    treatment_plan_api,
    catalog_api,
)

router = APIRouter()

# Các router hiện có
router.include_router(test_api.router, prefix="/test", tags=["Test Endpoints"])
router.include_router(auth_api.router, prefix="/auth", tags=["Authentication"])
router.include_router(users_api.router, prefix="/users", tags=["Users"])
router.include_router(roles_api.router, prefix="/admin", tags=["Roles & Permissions"])
router.include_router(
    schedules_api.router, prefix="/admin", tags=["Schedules Management"]
)

# THAY ĐỔI: Nhóm các API liên quan đến catalog sản phẩm
# Nếu bạn đã tạo catalog_api.py, hãy thêm vào đây
router.include_router(
    catalog_api.router, prefix="/catalog", tags=["Catalog Management"]
)

router.include_router(services_api.router, prefix="/services", tags=["Services"])
router.include_router(products_api.router, prefix="/products", tags=["Products"])
router.include_router(
    treatment_plan_api.router, prefix="/treatment-plans", tags=["Treatment Plans"]
)
