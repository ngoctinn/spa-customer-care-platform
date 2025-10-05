# app/api/test_api.py
from fastapi import APIRouter


router = APIRouter()


@router.get("/test")
async def get_test_endpoint():
    return {"message": "Test endpoint is working!"}
